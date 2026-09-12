import mongoose from "mongoose";
import app from "../app.js";
import request from "supertest";
import { User } from "../model/User.js";
// tests for authenication requests like login, signup, etc.

beforeAll(async () => {
  await mongoose.connect(`${process.env.TEST_DB_URI}`);
});
afterEach(async () => {
  await User.deleteMany({});
});
afterAll(async () => {
  await mongoose.connection.close();
});
describe("signup/register requests testing", () => {
  test("new user request ", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John Doe",
        email: "test1@example.com",
        password: "12345678",
      });
    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body).toHaveProperty("user");
    expect(registerResponse.body.user).toHaveProperty("name", "John Doe");
    expect(registerResponse.body).toHaveProperty(
      "message",
      "Account created successfully",
    );
  });

  test("new user request with missing password ", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Johen Doe",
        email: "test2@example.com",
      });

    expect(registerResponse.statusCode).toBe(400);
  });
  test("new user request with that resource conflict", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Bibek Ojha",
      email: "192bibek@gmail.com",
      password: "123456789",
    });
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Bibek Ojha",
        email: "192bibek@gmail.com",
        password: "123456789",
      });
    expect(registerResponse.statusCode).toBe(409);
  });
});

describe("login or sign in request testing", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test1@gmail.com",
      password: "123456789",
    });
  });
  test("login request with complete body", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test1@gmail.com",
      password: "123456789",
    });
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body).toHaveProperty("accesstoken");
    expect(loginResponse.body).toHaveProperty("user");
  });
  test("login request with incorrect credentails", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test1@gmail.com",
      password: "1234239430",
    });
    expect(loginResponse.statusCode).toBe(401);
  });
  test("login request with  missing fields like email or password", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test1@example.com",
    });
    expect(loginResponse.statusCode).toBe(400);
    expect(loginResponse.body).toHaveProperty("success", false);
  });

  test("login request less than 8 char password like zod validation error", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test1@example.com",
      password: "",
    });
    expect(loginResponse.statusCode).toBe(400);
  });
});
