import express from "express";
import { registrationUser } from "../controllers/user.controller";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
