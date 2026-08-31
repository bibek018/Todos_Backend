import { User } from "../model/User.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github";
import mongoose from "mongoose";
import logger from "./logger.js";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google email not provided"));
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });
        }

        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.debug("OAuth profile received", { profile });
        const email = profile?.emails?.[0]?.value;
        if (!email) {
          return done(
            new Error("GitHub email does not exists on this profile"),
            null,
          );
        }
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            name: profile?.displayName,
            githubId: profile?.id,
          });
        }
        if (!user.githubId) {
          user.githubId = profile.id;
          await user.save();
        }
        done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);
export default passport;
