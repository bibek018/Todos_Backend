import {catchAsync} from "../utils/catchAsync.js";
import { User } from "../model/User.js";

export const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    users,
  });
});
