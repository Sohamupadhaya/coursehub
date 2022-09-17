const express = require('express');
const router = express.Router();
const {createCourse,getCourseById,getAllCourses,updateCourses} = require('../controller/course')
router.post('/',createCourse)
router.get('/courses/:courseId',getCourseById)
router.get('/allcourses',getAllCourses)
router.put('/editcourses/:courseId',updateCourses)
module.exports = router;
