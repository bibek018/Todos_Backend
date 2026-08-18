import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/CatchAsync.js";
export const authMiddleware = catchAsync((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authenication is required", 401));
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    console.log("user has been set");
    next();
  }
);
