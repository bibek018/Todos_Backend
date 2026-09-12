import request  from "supertest";
import app from "../../app";

export const authUser = async () => {
  await request(app).post("/api/auth/register").send({
    name: "John",
    email: "abc@example.com",
    password: "12345678",
  });

  const response = await request(app).post("/api/auth/login").send({
    email: "abc@example.com",
    password: "12345678",
  });

  return response.body.accesstoken;
};


export const authUserChangePassword = async () => {
  await request(app).post("/api/auth/register").send({
    name: "John Moe",
    email: "abcd@example.com",
    password: "12345678",
  });

  const response = await request(app).post("/api/auth/login").send({
    email: "abcd@example.com",
    password: "12345678",
  });

  return response.body.accesstoken;
};
