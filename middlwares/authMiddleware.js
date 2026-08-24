import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
export const authMiddleware = catchAsync(async(req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authenication is required", 401));
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
  req.user = decoded;
  logger.info("User has been set");
  next();
});
