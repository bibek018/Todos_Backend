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
  const status = err.statusCode || 500;
  res.status(status).json({
    status,
    message: err.message,
    success: false,
    ...(err.details && {details:err.details})
  });
};
