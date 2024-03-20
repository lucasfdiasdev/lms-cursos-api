import mongoose from "mongoose";
import "dotenv/config";

const dbUrl: string = process.env.DB_URL || "";

export const connectDb = async () => {
  try {
    await mongoose.connect(dbUrl).then(() => {
      console.log(`Connected to MongoDB`);
    });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDb, 5000);
  }
};
