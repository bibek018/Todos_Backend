import express from "express";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
} from "../controllers/controller.todos.js";
import {getTodoSchema, validtodoSchema, validtodoUpdateSchema } from "../validators/todo.validator.js";
import {validate} from "../middlwares/validate.js";

const router = express.Router();

router.get("/", validate(getTodoSchema, "query"),getAllTodos);
router.post("/", validate(validtodoSchema),createTodo);
router.get("/:id", getTodoById);
router.patch("/:id", validate(validtodoUpdateSchema) , updateTodo);
router.delete("/:id", deleteTodo);

export default router;
