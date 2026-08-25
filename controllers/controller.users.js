import { User } from "../model/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import cloudinary from "../config/cloudinary.js";
import logger from "../utils/logger.js";
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js";
import bcrypt from "bcrypt";

export const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
});

export const getMyProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});
export const updateMyProfile = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  // Nothing was provided
  if (name === undefined && !req.file) {
    return next(new AppError("No changes provided", 400));
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update name if provided
  if (name !== undefined) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return next(new AppError("Name cannot be empty", 400));
    }

    if (user.name !== trimmedName) {
      user.name = trimmedName;
    }
  }

  if (req.file) {
    const oldPublicId = user.avatarPublicId;
    logger.info(oldPublicId);
    user.avatarUrl = req.file.path;
    user.avatarPublicId = req.file.filename;

    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }
  }
  await user.save();

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("User id not provided", 400));
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError("User does not exists", 404));
  }
  res.status(204).send();
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.userId)
    .select("+password")
    .select("+refreshtoken");

  if (!user) {
    return next(new AppError("User does not exist!", 404));
  }
  const isMatching = await bcrypt.compare(currentPassword, user.password);
  if (!isMatching) {
    return next(
      new AppError("Please enter correct password of this account", 401),
    );
  }
  user.password = newPassword;
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
    success: true,
    message: "Password changed successfully!",
  });
});
