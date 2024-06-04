import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  addAnswer,
  editCourse,
  addQuestion,
  uploadCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  addReview,
  addReplyToReview,
  getCourses,
  deleteCourse,
  generateVideoUrl,
} from "../controllers/course.controller";

export const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);
courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse
);
courseRouter.get("/get-courses", getCourses);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);
courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);
courseRouter.put(
  "/add-reply-review",
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview
);
courseRouter.get(
  "/get-all-courses",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllCourses
);
courseRouter.post("/get-vdo-cipher-otp", generateVideoUrl);
courseRouter.delete(
  "/delete-course/;id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCourse
);
