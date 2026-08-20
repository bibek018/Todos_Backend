import { success } from "zod";
import logger from "../utils/logger";

export const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: 400,
      message: err.message,
      success: false,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: 400,
      message: "Invalid ID",
      success: false,
    });
  }
  if (err.name === "JSONWebTokenError") {
    return res.status(401).json({
      status: 401,
      message: "Invalid access token",
      success: false,
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: 401,
      message: "Access Token Expired",
      success: false,
    });
  }
  const status = err.statusCode || 500;
  if (!err.isOperational && status === 500) {
    logger.error("Something went wrong!", {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
    });
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong", success: false });
  }
  logger.warn(`${err.message}`, {
    status,
    message: err.message,
    success: false,
    ...(err.details && { details: err.details }),
  });
  res.status(status).json({
    status,
    message: err.message,
    success: false,
    ...(err.details && { details: err.details }),
  });
};
