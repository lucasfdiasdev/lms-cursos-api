import { NextFunction, Request, Response } from "express";
import { userModel } from "../models/user.model";
import { ErrorHandler } from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { generateLast12MothsData } from "../utils/analytics.generator";

// get users analytics --- only admin can access
export const getUsersAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MothsData(userModel);

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);
