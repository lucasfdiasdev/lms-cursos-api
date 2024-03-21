import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { redis } from "../config/redis";
import { CatchAsyncError } from "./catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import { IUser } from "../repositories/user.repository";

// declare global
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// authenticated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return next(new ErrorHandler(400, "User is not authenticated"));
    }

    const decoded = jwt.verify(
      access_token,
      process.env.JWT_ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler(400, "access token is not valid"));
    }

    const user = await redis.get(decoded.id);

    console.log(user);

    if (!user) {
      return next(new ErrorHandler(400, "User not found"));
    }

    req.user = JSON.parse(user);

    next();
  }
);
