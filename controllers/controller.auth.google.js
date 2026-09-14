import { User } from "../model/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
export const googleAuthController = catchAsync(async (req, res, next) => {
  if (!req?.user?.email) {
    return next(new AppError("Google authentication failed", 400));
  }

  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const refreshtoken = await generateRefreshToken(user);

  res.cookie("refreshtoken", refreshtoken, {
    sameSite: "none",
    secure:true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.refreshtoken = refreshtoken;
  await user.save();

  res.redirect(`${process.env.CLIENT_ORIGIN}/dashboard`);
});
