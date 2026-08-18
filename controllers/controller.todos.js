import { Todo } from "../model/Todo.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
export const getAllTodos = catchAsync(async (req, res, next) => {
  const todos = await Todo.find({ user: req.user.userId }).sort({
    createdAt: -1,
  });
  res.status(200).json({
    success: true,
    todos,
  });
});

export const createTodo = catchAsync(async (req, res, next) => {
  const { title, status } = req.body;

  if (!title) {
    return next(new AppError("Title is required", 400));
  }

  const todo = await Todo.create({
    title,
    status,
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
  const { title, status } = req.body;

  const todo = await Todo.findOne({
    _id: req.params.id,
    user: req.user.userId,
  });

  if (!todo) {
    return next(new AppError("Todo does not exists", 404));
  }

  if (title !== undefined) todo.title = title;
  if (status !== undefined) todo.status = status;

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
