import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createOder, getAllOrders } from "../controllers/order.controller";

export const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOder);
orderRouter.get(
  "/get-all-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrders
);
