import { request } from "supertest";
import app from "../app.js";
import { authUser } from "./helper/auth.js";
import { Todo } from "../model/Todo.js";
import mongoose from "mongoose";
beforeAll(async () => {
  await mongoose.connect(`${process.env.TEST_DB_URI}`);
});
afterEach(async () => {
  await Todo.deleteMany({});
});
afterAll(async () => {
  await mongoose.connection.close();
});
describe("Todo API Test", () => {
  // Create Todo
  describe(" Todo create POST:/api/todos ", () => {
    let accesstoken = "";
    beforeEach(async () => {
      accesstoken = await authUser();
    });
    test("should create a valid todo with valid data", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({
          title: "To finish this todo project",
          status: "in progress",
          priority: "high",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("todo");
      expect(response.body.todo).toHaveProperty(
        "title",
        "To finish this todo project",
      );
    });
    test("should provide unauthenicated error without accesstoken", async () => {
      const response = await request(app).post("/api/todos").send({
        title: "To finish this todo project",
        status: "in progress",
        priority: "high",
      });
      expect(response.statusCode).toBe(401);
    });
    test("should reject the request  on missing the title ", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({
          status: "in progress",
          priority: "high",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(400);
    });

    test("should default create the status and priority on missing ", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({
          title: "To finish this todo project",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
      expect(response.statusCode).toBe(201);

      expect(response.body).toHaveProperty("todo");
      expect(response.body.todo).toHaveProperty(
        "title",
        "To finish this todo project",
      );
      expect(response.body.todo).toHaveProperty("status", "not started");
      expect(response.body.todo).toHaveProperty("priority", "medium");
    });
    test("should reject todo with title shorter than minimum length", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({ title: "Todo", status: "not started", priority: "high" })
        .set("Authorization", `Bearer ${accesstoken}`);
      expect(response.statusCode).toBe(400);
    });
    test("should reject todo with invalid status", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({
          title: "Learn Supertest properly",
          status: "invalid status",
          priority: "high",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
      expect(response.statusCode).toBe(400);
    });
    test("should reject todo with invalid priority", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({
          title: "Learn Supertest properly",
          status: "not started",
          priority: "invalid priority",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
      expect(response.statusCode).toBe(400);
    });
  });

  // GET TODOS

  describe("GET /api/todos", () => {
    let accesstoken = "";

    beforeEach(async () => {
      accesstoken = await authUser();

      // Create Todo 1
      await request(app)
        .post("/api/todos")
        .send({
          title: "Learn Node.js",
          status: "completed",
          priority: "high",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      // Create Todo 2
      await request(app)
        .post("/api/todos")
        .send({
          title: "Learn Express.js",
          status: "in progress",
          priority: "medium",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      // Create Todo 3
      await request(app)
        .post("/api/todos")
        .send({
          title: "Learn MongoDB",
          status: "completed",
          priority: "low",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
    });

    // DEFAULT GET

    test("should return todos with default pagination", async () => {
      const response = await request(app)
        .get("/api/todos")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      // Check todos
      expect(response.body).toHaveProperty("todos");
      expect(Array.isArray(response.body.todos)).toBe(true);

      // Check pagination
      expect(response.body).toHaveProperty("pagination");
      expect(typeof response.body.pagination).toBe("object");

      // Check default values
      expect(response.body.pagination).toHaveProperty("page", 1);
      expect(response.body.pagination).toHaveProperty("limit", 10);

      // We created 3 todos
      expect(response.body.pagination).toHaveProperty("totalTodos", 3);
    });

    // CUSTOM PAGINATION

    test("should return todos according to custom page and limit", async () => {
      const response = await request(app)
        .get("/api/todos")
        .query({
          page: 1,
          limit: 2,
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("todos");
      expect(Array.isArray(response.body.todos)).toBe(true);

      expect(response.body).toHaveProperty("pagination");

      expect(response.body.pagination).toHaveProperty("page", 1);
      expect(response.body.pagination).toHaveProperty("limit", 2);

      // Only 2 todos should be returned because limit = 2
      expect(response.body.todos.length).toBe(2);
    });

    // STATUS FILTER

    test("should return todos filtered by status", async () => {
      const response = await request(app)
        .get("/api/todos")
        .query({
          status: "completed",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("todos");
      expect(Array.isArray(response.body.todos)).toBe(true);

      // We created 2 completed todos
      expect(response.body.todos.length).toBe(2);

      // Every returned todo should have completed status
      response.body.todos.forEach((todo) => {
        expect(todo.status).toBe("completed");
      });
    });

    // PRIORITY FILTER

    test("should return todos filtered by priority", async () => {
      const response = await request(app)
        .get("/api/todos")
        .query({
          priority: "high",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("todos");
      expect(Array.isArray(response.body.todos)).toBe(true);

      // We created 1 high-priority todo
      expect(response.body.todos.length).toBe(1);

      expect(response.body.todos[0].priority).toBe("high");
    });

    // STATUS + PRIORITY FILTER

    test("should filter todos using status and priority together", async () => {
      const response = await request(app)
        .get("/api/todos")
        .query({
          status: "completed",
          priority: "high",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("todos");
      expect(Array.isArray(response.body.todos)).toBe(true);

      // Only "Learn Node.js" matches both
      expect(response.body.todos.length).toBe(1);

      expect(response.body.todos[0].status).toBe("completed");
      expect(response.body.todos[0].priority).toBe("high");
    });

    // SORTING

    test("should return todos according to selected sort and order", async () => {
      const response = await request(app)
        .get("/api/todos")
        .query({
          sort: "title",
          order: "asc",
        })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("todos");
      expect(Array.isArray(response.body.todos)).toBe(true);

      // Alphabetical order:
      // Learn Express.js
      // Learn MongoDB
      // Learn Node.js

      expect(response.body.todos[0].title).toBe("Learn Express.js");
      expect(response.body.todos[1].title).toBe("Learn MongoDB");
      expect(response.body.todos[2].title).toBe("Learn Node.js");
    });

    // AUTHENTICATION

    test("should reject request without authentication", async () => {
      const response = await request(app).get("/api/todos");

      expect(response.statusCode).toBe(401);

      expect(response.body).toHaveProperty(
        "message",
        "Authentication is required",
      );
    });
  });
  // Update Todos
  describe("PATCH /api/todos/:id", () => {
    let accesstoken = "";
    let todo = {};

    beforeEach(async () => {
      accesstoken = await authUser();
      // Create Todo 1
      todo = await request(app)
        .post("/api/todos")
        .send({
          title: "Learn Node.js",
          status: "not started",
          priority: "low",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
    });

    test("should update title only", async () => {
      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send({ title: "Learn Node.js fast" })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(200);
      expect(todoResponse.body.todo).toMatchObject({
        title: "Learn Node.js fast",
        status: "not started",
        priority: "low",
      });
    });

    test("should update status only", async () => {
      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send({ status: "completed" })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(200);
      expect(todoResponse.body.todo.status).toBe("completed");
    });

    test("should update priority only", async () => {
      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send({ priority: "high" })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(200);
      expect(todoResponse.body.todo.priority).toBe("high");
    });

    test("should update all fields simultaneously", async () => {
      const payload = {
        title: "Learn Node.js very fast",
        priority: "low",
        status: "in progress",
      };

      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send(payload)
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(200);
      expect(todoResponse.body.todo).toMatchObject(payload);
    });

    test("should return 400 for invalid priority enum", async () => {
      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send({ priority: "very high" })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(400);
    });

    test("should return 400 for invalid status enum", async () => {
      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send({ status: "full" })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(400);
    });

    test("should return 400 when title is below min length", async () => {
      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send({ title: "Learn" })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(400);
      expect(todoResponse.body).toHaveProperty("message", "Validation Failed");
    });

    test("should return 400 for malformed Mongo ID", async () => {
      const todoResponse = await request(app)
        .patch("/api/todos/invalid-id")
        .send({ priority: "high" })
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(todoResponse.statusCode).toBe(400);
    });

    test("should return 401 when access token is missing", async () => {
      const todoResponse = await request(app)
        .patch(`/api/todos/${todo.body.todo._id}`)
        .send({ priority: "high" });

      expect(todoResponse.statusCode).toBe(401);
    });
  });
  // Delete Todos
  describe("DELETE /api/todos/:id", () => {
    let accesstoken = "";
    let todo = {};

    beforeEach(async () => {
      accesstoken = await authUser();
      // Create Todo 1
      todo = await request(app)
        .post("/api/todos")
        .send({
          title: "Learn Node.js",
          status: "not started",
          priority: "low",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
    });

    test("should successfully delete a todo", async () => {
      const deleteRes = await request(app)
        .delete(`/api/todos/${todo.body.todo._id}`)
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body).toHaveProperty("message");

      // Verify item no longer exists
      const getRes = await request(app)
        .get(`/api/todos/${todo.body.todo._id}`)
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(getRes.statusCode).toBe(404);
    });

    test("should return 401 when access token is missing", async () => {
      const res = await request(app).delete(`/api/todos/${todo.body.todo._id}`);

      expect(res.statusCode).toBe(401);
    });

    test("should return 400 for malformed Mongo ID", async () => {
      const res = await request(app)
        .delete("/api/todos/invalid-id")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(res.statusCode).toBe(400);
    });

    test("should return 404 for non-existent valid ID", async () => {
      const nonExistentId = "60d5ecb8b5c9c22b1c8e4567";
      const res = await request(app)
        .delete(`/api/todos/${nonExistentId}`)
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  //GET A SINGLE TODO
  describe("GET /api/todos/:id", () => {
    let accesstoken = "";
    let todo = {};

    beforeEach(async () => {
      accesstoken = await authUser();
      // Create Todo 1
      todo = await request(app)
        .post("/api/todos")
        .send({
          title: "Learn Node.js",
          status: "not started",
          priority: "low",
        })
        .set("Authorization", `Bearer ${accesstoken}`);
    });
    test("should successfully get a todo", async () => {
      const response = await request(app)
        .get(`/api/todos/${todo.body.todo._id}`)
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("todo");
      expect(response.body.todo._id).toBe(todo.body.todo._id);
    });

    test("should return 401 when access token is missing", async () => {
      const res = await request(app).get(`/api/todos/${todo.body.todo._id}`);

      expect(res.statusCode).toBe(401);
    });

    test("should return 400 for malformed Mongo ID", async () => {
      const res = await request(app)
        .get("/api/todos/invalid-id")
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(res.statusCode).toBe(400);
    });

    test("should return 404 for non-existent valid ID", async () => {
      const nonExistentId = "60d5ecb8b5c9c22b1c8e4567";
      const res = await request(app)
        .get(`/api/todos/${nonExistentId}`)
        .set("Authorization", `Bearer ${accesstoken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
