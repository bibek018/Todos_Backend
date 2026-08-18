import { User } from "../model/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
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
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password) user.password = password;

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
  } );
