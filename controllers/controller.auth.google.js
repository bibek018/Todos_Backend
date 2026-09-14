import { User } from "../model/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const googleAuthController = catchAsync(async (req, res, next) => {
  if (!req?.user?.email) {
    return next(new AppError("Google authentication failed", 400));
  }

  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const refreshtoken = await generateRefreshToken(user);
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info("========== ENV CHECK STARTS ==========");
  logger.info(`ACCESS_SECRET: ${JSON.stringify(process.env.ACCESS_SECRET)}`);
  logger.info(`CLIENT_ORIGIN: ${JSON.stringify(process.env.CLIENT_ORIGIN)}`);
  logger.info(
    `CLOUDINARY_API_KEY: ${JSON.stringify(process.env.CLOUDINARY_API_KEY)}`,
  );
  logger.info(
    `CLOUDINARY_API_SECRET: ${JSON.stringify(process.env.CLOUDINARY_API_SECRET)}`,
  );
  logger.info(
    `CLOUDINARY_CLOUD_NAME: ${JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME)}`,
  );
  logger.info(
    `GITHUB_CLIENT_ID: ${JSON.stringify(process.env.GITHUB_CLIENT_ID)}`,
  );
  logger.info(
    `GITHUB_CLIENT_SECRET: ${JSON.stringify(process.env.GITHUB_CLIENT_SECRET)}`,
  );
  logger.info(
    `GOOGLE_CLIENT_ID: ${JSON.stringify(process.env.GOOGLE_CLIENT_ID)}`,
  );
  logger.info(
    `GOOGLE_CLIENT_SECRET: ${JSON.stringify(process.env.GOOGLE_CLIENT_SECRET)}`,
  );
  logger.info(`MONGO_URI: ${JSON.stringify(process.env.MONGO_URI)}`);
  logger.info(`NODE_ENV: ${JSON.stringify(process.env.NODE_ENV)}`);
  logger.info(`REFRESH_SECRET: ${JSON.stringify(process.env.REFRESH_SECRET)}`);
  logger.info(`SERVER_URL: ${JSON.stringify(process.env.SERVER_URL)}`);
  logger.info("========== ENV CHECK ENDS ==========");
  user.refreshtoken = refreshtoken;
  await user.save();

  res.redirect(`${process.env.CLIENT_ORIGIN}/dashboard`);
});
