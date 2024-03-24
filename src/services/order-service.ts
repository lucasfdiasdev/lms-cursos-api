import { NextFunction, Response } from "express";
import { orderModel } from "../models/order.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";

export const newOrder = CatchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await orderModel.create(data);
    res.status(201).json({
      success: true,
      order,
    });
  }
);
