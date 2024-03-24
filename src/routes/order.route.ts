import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { createOder } from "../controllers/order.controller";

export const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOder);
