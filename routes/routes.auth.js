import express from "express";
import {
  createAccount,
  loginAccount,
  handleRefresh,
  handleLogout,
} from "../controllers/controller.auth.js";
import { googleAuthController } from "../controllers/controller.auth.google.js";
import { githubAuthController } from "../controllers/controller.auth.github.js";
import passport from "passport";
import { signinSchema, signupSchema } from "../validators/user.validator.js";
import { validate } from "../middlwares/validate.js";
const router = express.Router();
router.post("/register", validate(signupSchema), createAccount);
router.post("/login", validate(signinSchema), loginAccount);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleAuthController,
);

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  }),
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  githubAuthController,
);

router.post("/refresh", handleRefresh);
router.post("/logout", handleLogout);
export default router;
