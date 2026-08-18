import { User } from "../model/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js";
import { catchAsync } from "../utils/CatchAsync.js";
import {AppError} from "../utils/AppError.js";
export const googleAuthController = catchAsync(async (req, res, next) => {
  if (!req?.user?.email) {
    return next(new AppError("Google authentication failed", 400));
  }

  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const accesstoken = generateAccessToken(user);
  const refreshtoken = generateRefreshToken(user);

  res.cookie("refreshtoken", refreshtoken, {
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.refreshtoken = refreshtoken;
  await user.save();

  res.redirect(`${process.env.CLIENT_ORIGIN}/dashboard`);
}
);
