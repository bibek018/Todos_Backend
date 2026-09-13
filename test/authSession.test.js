import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { User } from "../model/User.js";

// Tests for refresh token flow, logout, and token expiry/tampering.
// Uses request.agent(app) instead of request(app) because the refresh
// token lives in an httpOnly cookie — an agent persists cookies across
// requests the same way a real browser session would.

beforeAll(async () => {
  const uri = process.env.TEST_DB_URI;

  if (!uri || !uri.includes("test")) {
    throw new Error(
      "Refusing to run tests: TEST_DB_URI is missing or doesn't look like a test database.",
    );
  }

  await mongoose.connect(uri); 
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

const testUser = {
  name: "Session Tester",
  email: "session@example.com",
  password: "12345678",
};

// Helper: registers + logs in using a fresh agent, so the agent's cookie
// jar picks up the refreshtoken cookie set on login.
const loginWithAgent = async () => {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send(testUser);
  const loginRes = await agent.post("/api/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  return { agent, loginRes };
};

describe("POST /api/auth/refresh", () => {
  test("should issue a new access token with a valid refresh cookie", async () => {
    const { agent } = await loginWithAgent();

    const refreshRes = await agent.post("/api/auth/refresh");

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
    expect(refreshRes.body).toHaveProperty("user");
  });

  test("should reject refresh with no cookie at all", async () => {
    // Plain request(app), not an agent — no cookie jar, nothing sent.
    const res = await request(app).post("/api/auth/refresh");

    expect(res.statusCode).toBe(401);
  });

  test("should reject a tampered/garbage refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refreshtoken=this.is.not.a.valid.jwt"]);

    expect(res.statusCode).toBe(401);
  });

  test("should reject an expired refresh token", async () => {
    // Sign a token with the real secret but an already-expired lifetime.
    const expiredToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId() },
      process.env.REFRESH_SECRET,
      { expiresIn: "-10s" },
    );

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [`refreshtoken=${expiredToken}`]);

    expect(res.statusCode).toBe(401);
  });
  test("should reject a stale refresh token after it has been rotated", async () => {
    const { agent, loginRes } = await loginWithAgent();
    //capture the original refresh token
    const originalToken = loginRes.headers["set-cookie"].find((c) =>
      c.startsWith("refreshtoken="),
    );
    //send request via the agent to refresh the token in the db
    const newRefresh = await agent.post("/api/auth/refresh");
    expect(newRefresh.statusCode).toBe(200);
    // Now try to refresh the refreshtoken using that previous or originalToken , with the normal request not with agent
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", originalToken);
    expect(res.statusCode).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  test("should log out successfully and clear the refresh token in the DB", async () => {
    const { agent } = await loginWithAgent();

    const logoutRes = await agent.post("/api/auth/logout");
    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body).toHaveProperty("success", true);

    // Confirm the DB side actually happened, not just the response shape.
    const user = await User.findOne({ email: testUser.email }).select(
      "+refreshtoken",
    );
    expect(user.refreshtoken).toBeNull();
  });

  test("should reject logout with no cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(401);
  });

  test("refresh token should no longer work after logout", async () => {
    const { agent } = await loginWithAgent();

    await agent.post("/api/auth/logout");

    // Same agent, same cookie jar — but the server cleared the cookie
    // via res.clearCookie(), so the agent should have nothing to send now.
    const refreshRes = await agent.post("/api/auth/refresh");
    expect(refreshRes.statusCode).toBe(401);
  });
});
