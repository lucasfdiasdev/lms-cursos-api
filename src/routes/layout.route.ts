import express from "express";
import {
  createLayout,
  getLayoutByType,
  updateLayout,
} from "../controllers/layout.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
export const layoutRouter = express.Router();

layoutRouter.post(
  "/create-layout",
  isAuthenticated,
  authorizeRoles("admin"),
  createLayout
);
layoutRouter.put(
  "/edit-layout",
  isAuthenticated,
  authorizeRoles("admin"),
  updateLayout
);
layoutRouter.get("/get-layout", getLayoutByType);
