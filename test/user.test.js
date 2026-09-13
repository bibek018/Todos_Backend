import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";
import { authUser, authUserChangePassword } from "./helper/auth.js";
import { User } from "../model/User.js";

describe("User API", () => {
  // CHANGE PASSWORD

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
  describe("POST /api/users/me/changepassword", () => {
    let accesstoken = "";

    beforeEach(async () => {
      accesstoken = await authUserChangePassword();
    });

    test("should change password with valid authentication", async () => {
      const response = await request(app)
        .put("/api/users/me/changepassword")
        .send({
          currentPassword: "12345678",
          newPassword: "123456789",
          confirmNewPassword: "123456789",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty(
        "message",
        "Password changed successfully!",
      );
    });

    test("should reject password change without authentication", async () => {
      const response = await request(app)
        .put("/api/users/me/changepassword")
        .send({
          currentPassword: "12345678",
          newPassword: "123456789",
          confirmNewPassword: "123456789",
        });

      expect(response.statusCode).toBe(401);

      expect(response.body).toHaveProperty(
        "message",
        "Authentication is required",
      );
    });

    test("should reject password change with missing fields", async () => {
      const response = await request(app)
        .put("/api/users/me/changepassword")
        .send({
          currentPassword: "12345678",
          newPassword: "123456789",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(400);
    });

    test("should reject when new password and confirmation do not match", async () => {
      const response = await request(app)
        .put("/api/users/me/changepassword")
        .send({
          currentPassword: "12345678",
          newPassword: "123456789",
          confirmNewPassword: "12345678910",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(400);
    });

    test("should reject when current password is incorrect", async () => {
      const response = await request(app)
        .put("/api/users/me/changepassword")
        .send({
          currentPassword: "wrongpassword",
          newPassword: "123456789",
          confirmNewPassword: "123456789",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
      expect(response.statusCode).toBe(401);
    });
  });

  // PROFILE UPDATE

  describe("PUT /api/users/me", () => {
    let accesstoken = "";

    beforeEach(async () => {
      accesstoken = await authUser();
    });

    test("should update name without profile photo", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .field("name", "Bibek Ojha")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("user");
    });

    test("should update profile photo without changing name", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .attach("avatar", "test/img/profile.png")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("user");
    });

    test("should update both name and profile photo", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .field("name", "Apple Tim")
        .attach("avatar", "test/img/profile.png")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("user");
    });

    test("should reject profile update without authentication", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .field("name", "Apple Tim");

      expect(response.statusCode).toBe(401);
    });

    test("should reject invalid name", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .field("name", "A")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(400);
    });

    test("should reject invalid profile photo type", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .attach("avatar", "test/img/invalid.txt")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(400);
    });
  });

  // GET CURRENT USER

  describe("GET /api/users/me", () => {
    let accesstoken = "";

    beforeEach(async () => {
      accesstoken = await authUser();
    });

    test("should get user details with valid authentication", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("user");
    });

    test("should reject request without authentication", async () => {
      const response = await request(app).get("/api/users/me");

      expect(response.statusCode).toBe(401);
    });
  });
});
