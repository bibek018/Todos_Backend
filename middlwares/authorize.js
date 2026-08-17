export const authorize = (...allowedRoles) => {
  return (req, res, next)=>
  {
    try {
      if (!allowedRoles.includes(req.user.role)) {
        const err = new Error(
          "Error, You do not have permission to perform this",
        );
        err.statusCode = 403;
        throw err;
      }
      next();
    } catch (err) {
      next(err);
    }
  }
};
