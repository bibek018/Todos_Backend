import express from "express";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
} from "../controllers/controller.todos.js";
import { validtodoSchema, validtodoUpdateSchema } from "../validators/todo.validator.js";
import {validate} from "../middlwares/validate.js";

const router = express.Router();

router.get("/", getAllTodos);
router.post("/", validate(validtodoSchema),createTodo);
router.get("/:id", getTodoById);
router.put("/:id", validate(validtodoUpdateSchema) , updateTodo);
router.delete("/:id", deleteTodo);

export default router;
