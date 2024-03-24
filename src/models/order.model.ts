import mongoose, { Model, Schema } from "mongoose";
import { IOrder } from "../repositories/order.respoitory";

const orderSchema = new Schema<IOrder>(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    payment_info: {
      type: Object,
      // required: true,
    },
  },
  { timestamps: true }
);

export const orderModel: Model<IOrder> = mongoose.model("Order", orderSchema);
