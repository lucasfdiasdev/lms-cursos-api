import express from "express";
import {
  loginUser,
  logoutUser,
  activateUser,
  registrationUser,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
