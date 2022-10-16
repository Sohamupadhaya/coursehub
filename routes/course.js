const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  createCourse,
  getCourseById,
  getAllCourses,
  updateCourses,
  deleteCourse
} = require("../controller/course");

router.post("/", createCourse);
router.get("/courses/:courseId",getCourseById);
router.get("/allcourses", getAllCourses);
router.put("/editcourses/:courseId", updateCourses);
router.delete("/deleteCourse/:courseId", deleteCourse);
module.exports = router;
