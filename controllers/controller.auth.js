import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../model/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createAccount = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return next(new AppError("Bad Request", 400));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists", 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const loginAccount = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Bad Request", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid Credentials", 401));
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return next(new AppError("Invalid Credentials", 401));
  }

  const accesstoken = await generateAccessToken(user);
  const refreshtoken = await generateRefreshToken(user);
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  user.refreshtoken = refreshtoken;
  await user.save();
  res.status(200).json({
    message: "Logged in Successfully",
    success: true,
    user,
    accesstoken,
  });
});

export const handleRefresh = catchAsync(async (req, res, next) => {
  const rtoken = req.cookies.refreshtoken;
  if (!rtoken) return next(new AppError("Refresh token not provided", 401));

  const payload = jwt.verify(rtoken, process.env.REFRESH_SECRET);
  const user = await User.findById(payload.userId).select("+refreshtoken");
  if (!user)
    return next(
      new AppError("User no longer exists. Please log in again", 401),
    );
  if (user.refreshtoken !== rtoken)
    return next(
      new AppError("User no longer exists. Please log in again", 401),
    );

  const newrefreshtoken = await generateRefreshToken(user);
  res.cookie("refreshtoken", newrefreshtoken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  user.refreshtoken = newrefreshtoken;
  await user.save();
  const accessToken = await generateAccessToken(user);
  res.status(200).json({
    success: true,
    user,
    accessToken,
  });
});

export const handleLogout = catchAsync(async (req, res, next) => {
  const rtoken = req.cookies.refreshtoken;
  if (!rtoken) {
    return next(new AppError("Refresh token not provided", 401));
  }
  const payload = jwt.verify(rtoken, process.env.REFRESH_SECRET);
  const user = await User.findById(payload.userId).select("+refreshtoken");
  if (!user) {
    return next(
      new AppError("User no longer exists. Please log in again", 401),
    );
  }
  if (user.refreshtoken !== rtoken) {
    return next(
      new AppError("Session is no longer valid. Please log in again.", 401),
    );
  }
  user.refreshtoken = null;
  res.clearCookie("refreshtoken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  await user.save();
  res.status(200).json({
    success: true,
  });
});
