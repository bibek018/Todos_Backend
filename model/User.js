import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    default: null,
    select: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  githubId:{
    type:String,
    sparse:true,
    unique:true,
  },
  refreshtoken: {
    type: String,
    default: null,
    select: false,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User", userSchema);
