import "dotenv/config";
import { app } from "./config/app";
import { connectDb } from "./config/db";
import { v2 as cloudinary } from "cloudinary";
import { ErrorMiddleware } from "./middleware/error";

// couldnary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET_KEY,
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDb();
});

app.use(ErrorMiddleware);
