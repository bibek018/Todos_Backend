import { AppError } from "../utils/AppError.js";
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!allowedRoles.includes(req.user.role)) {
        return next(
          new AppError(
            "Error, You do not have permission to perform this",
            403,
          )
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
