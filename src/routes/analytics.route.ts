import express from "express";
import {
  getCoursesAnalytics,
  getUsersAnalytics,
} from "../controllers/analytics.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
export const analyticsRouter = express.Router();

analyticsRouter.get(
  "/get-users-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getUsersAnalytics
);

analyticsRouter.get(
  "/get-courses-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getCoursesAnalytics
);
