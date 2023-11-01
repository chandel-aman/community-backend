import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY as string,
};

passport.use(
  new Strategy(options, async (payload: any, done: any) => {
    try {
      const user = await User.findById(payload.userId).select("-chats");
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export const passportConfig = {
  initialize: passport.initialize(),
  authenticate: passport.authenticate("jwt", { session: false }),
};
