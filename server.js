import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./middlwares/logger.js";
import { dbConnection } from "./utils/dbConnection.js";
import { authMiddleware } from "./middlwares/authMiddleware.js";
import authRouter from "./routes/routes.auth.js";
import userRouter from "./routes/routes.users.js";
import todoRouter from "./routes/routes.todos.js";
import adminRouter from "./routes/routes.admin.js";
import { notFound } from "./middlwares/notFound.js";
import { errorHandler } from "./middlwares/errorHandler.js";
import cookieParser from "cookie-parser";
import passport from "./utils/passport.js";
import "./utils/passport.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(logger);
dbConnection();

app.use("/api/auth", authRouter);
app.use("/api/admin", authMiddleware, adminRouter);
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/todos", authMiddleware, todoRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening at port:${process.env.PORT || 3000}`);
});
