import express from "express";
import {
  loginUser,
  logoutUser,
  activateUser,
  registrationUser,
  updateAccessToken,
  getUserInfo,
  socialAuth,
  updateUserInfo,
  updatePassword,
  updateAvatar,
  getAllUsers,
  updateUserRole,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login-user", loginUser);
userRouter.post("/social-auth", socialAuth);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refreshtoken", updateAccessToken);
userRouter.get("/get-user", isAuthenticated, getUserInfo);
userRouter.put("/update-user", isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password", isAuthenticated, updatePassword);
userRouter.put("/update-user-avatar", isAuthenticated, updateAvatar);
userRouter.get(
  "/get-all-users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsers
);
userRouter.put(
  "/update-user-role",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRole
);
