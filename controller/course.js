const express = require("express");
const { find, findOneAndDelete } = require("../models/Course");
const Course = require("../models/Course");
const { validateCourse } = require("../validations/validateCourse");
exports.createCourse = async (req, res) => {
  try {
    const { errors } = validateCourse(req.body);
    if (errors) {
      res.send(errors);
      return;
    }
    let courseAll = {
      courseName: req.body.courseName,
      description: req.body.description,
      category: req.body.category,
      outcome: req.body.outcome,
      createdBy: req.body.createdBy,
      slides: [],
    };
    console.log("entries:", req.body.slides.entries());
    for (let [index, data] of req.body.slides.entries()) {
      let slideData = {};
      slideData.slideNo = data.slideNo;
      slideData.code = data.code;
      slideData.img = data.img;
      console.log("slideData:", slideData);
      courseAll.slides.push(slideData);
    }
    console.log(courseAll);

    const course = new Course(courseAll);
    // console.log(course);
    createCourse = await course.save();
    if (!createCourse) {
      return res.status(400).json({ message: "data not insert in database" });
    }
    res.json(course);
  } catch (err) {
    console.log(err);
    res.send("error");
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const getAllCourse = await Course.findOne({ _id: req.params.courseId });
    if (!getAllCourse) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(getAllCourse);
  } catch (err) {
    console.log(err);
    res.send("error");
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find();
    if (!allCourses) {
      return res.this.status(400).json({ message: "No course found" });
    }
    res.json(allCourses);
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
};

exports.updateCourses = async (req, res) => {
  try {
    const { errors } = validateCourse(req.body);
    if (errors) {
      res.send(errors);
      return;
    }
    const getAllCourse = await Course.findOne({ _id: req.params.courseId });
    if (!getAllCourse) {
      return res.status(400).json({ message: "User not found" });
    }
    let editAll = {
      courseName: req.body.courseName,
      description: req.body.description,
      category: req.body.category,
      outcome: req.body.outcome,
      createdBy: req.body.createdBy,
      slides: [],
    };
    for (let [index, data] of req.body.slides.entries()) {
      allEdit = {};
      allEdit.slideNo = data.slideNo;
      allEdit.img = data.img;
      allEdit.code = data.code;
      editAll.slides.push(allEdit);
    }
    console.log(editAll);
    const editCourse = await Course.findOneAndUpdate(
      { _id: req.params.courseId },
      { $set: editAll },
      { new: true, upsert: true }
    );
    console.log(editCourse);
    if (!editCourse) {
      return res.status(400).json({ message: "Update could not be peform" });
    }
    res.json(editCourse);
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const getAllCourse = await Course.findOne({ _id: req.params.courseId });
    if (!getAllCourse) {
      return res.status(400).json({ message: "User not found" });
    }
    const courseDelete = await Course.findOneAndUpdate(
      { _id: req.params.courseId },
      {
        $set: {
          isDelete: true,
        },
      }
    );
    if (!courseDelete) {
      res.json({ message: "data is not deleted" });
    }
    res.json({ message: "data deleted" });
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
};
