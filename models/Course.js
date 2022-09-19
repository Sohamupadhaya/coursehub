var mongoose = require("mongoose");

const course = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    }, // Python, C, C++
    outcome: {
      type: String,
      required: true,
    }, // WYSIWYG editor
    createdBy: {
      type: String,
      required: true,
    },
    isDelete: {
      type:Boolean,
      default: false,
    },
    slides: [
      {
        slideNo: {
          type: Number,
          required: true,
        },
        img: {
          type: String,
          required: true,
        },
        code: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", course);
