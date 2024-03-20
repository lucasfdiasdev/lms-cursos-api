import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

// app use configuration settings
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Server running on port 5000");
});
