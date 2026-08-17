import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("Authenication is required");
      err.statusCode = 401;
      throw err;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    console.log("user has been set")
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      err.statusCode = 401;
      err.message = "Token has expired";
    } else if (err.name === "JsonWebTokenError") {
      err.statusCode = 401;
      err.message = "Invalid token";
    }
    next(err);
  }
};
