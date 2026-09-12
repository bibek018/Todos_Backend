import rateLimit from "express-rate-limit";
isTestEnv = process.env.NODE_ENV === "Test";
export const authlimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  message: { error: "Too many requests, Please try again later!" },
});
export const generallimiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  message: { error: "Too many requests, Please try again later!" },
});
