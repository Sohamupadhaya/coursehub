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

router.post("/",passport.authenticate('jwt',{ session: false }), createCourse);
router.get("/courses/:courseId",passport.authenticate('jwt',{ session: false }) ,getCourseById);
router.get("/allcourses",passport.authenticate('jwt',{ session: false }), getAllCourses);
router.put("/editcourses/:courseId",passport.authenticate('jwt',{ session: false }), updateCourses);
router.delete("/deleteCourse/:courseId",passport.authenticate('jwt',{ session: false }), deleteCourse);
module.exports = router;
