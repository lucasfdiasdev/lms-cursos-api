import mongoose, { Model, Schema } from "mongoose";
import { INotification } from "../repositories/notification.respoitory";

const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "unread",
  },
});

export const notificationModel: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);
