import jwt from "jsonwebtoken";
export const generateAccessToken = (user) => {
  const accesstoken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: "15m",
    },
  );
  return accesstoken;
};
export const generateRefreshToken = (user) => {
  const refreshtoken = jwt.sign(
    {
      userId: user._id,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return refreshtoken;
};
