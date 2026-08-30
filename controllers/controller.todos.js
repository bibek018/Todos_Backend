import { Todo } from "../model/Todo.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { success } from "zod";
export const getAllTodos = catchAsync(async (req, res, next) => {
  const { page, limit, status, priority, sort, order } = req.validated.query;

  const filter = { user: req.user.userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const sortOrder = order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    Todo.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sort]: sortOrder }),
    Todo.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    todos,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const createTodo = catchAsync(async (req, res, next) => {
  const { title, status, priority } = req.validated.body;

  if (!title) {
    return next(new AppError("Title is required", 400));
  }

  const todo = await Todo.create({
    title,
    status,
    priority,
    user: req.user.userId,
  });

  res.status(201).json({
    success: true,
    todo,
  });
});

export const getTodoById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const todo = await Todo.findOne({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!todo) {
    return next(new AppError("Todo does not exits", 404));
  }
  res.status(200).json({
    success: true,
    todo,
  });
});

export const updateTodo = catchAsync(async (req, res, next) => {
  const { title, status, priority } = req.validated.body;

  const todo = await Todo.findOne({
    _id: req.params.id,
    user: req.user.userId,
  });

  if (!todo) {
    return next(new AppError("Todo does not exists", 404));
  }

  if (title !== undefined) todo.title = title;
  if (status !== undefined) todo.status = status;
  if (priority !== undefined) todo.priority = priority;

  await todo.save();

  res.status(200).json({
    success: true,
    todo,
  });
});

export const deleteTodo = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const todo = await Todo.findOne({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!todo) {
    return next(new AppError("Todo does not exists", 404));
  }
  await todo.deleteOne();
  res.sendStatus(204);
});
