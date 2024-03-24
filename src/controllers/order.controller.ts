import ejs from "ejs";
import path from "path";
import { NextFunction, Request, Response } from "express";
import { sendMail } from "../utils/sendMail";
import { userModel } from "../models/user.model";
import { newOrder } from "../services/order-service";
import { courseModel } from "../models/course.model";
import { ErrorHandler } from "../utils/ErrorHandler";
import { IOrder } from "../repositories/order.respoitory";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { notificationModel } from "../models/notification.model";

// create order
export const createOder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      const user = await userModel.findById(req.user?._id);

      const courseExistInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      if (courseExistInUser) {
        return next(
          new ErrorHandler(400, "You have already purchased this course.")
        );
      }

      const course = await courseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }

      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(400, error.message));
      }

      user?.courses.push(course?._id);

      await user?.save();

      await notificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course?.name}`,
      });

      course.purchased ? (course.purchased += 1) : course.purchased;

      await course.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);
