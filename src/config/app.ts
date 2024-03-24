import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { userRouter } from "../routes/user.route";
import { orderRouter } from "../routes/order.route";
import { courseRouter } from "../routes/course.route";

export const app = express();

// app use configuration settings
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors());

// app api routes
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
``;
app.use("/api/v1", orderRouter);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Test successfully executed",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});
