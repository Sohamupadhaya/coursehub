var mongoose = require("mongoose");

const enroll = new mongoose.Schema(
  {
    course: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
      required: true,
    }, //id
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    }, // boolean
    progress: [
      {
        slideNo: {
          type: Number,
          required: true,
        },
        visited: {
          type: Boolean,
          default: false,
        }, // boolean
        enteredCode: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enroll", enroll);
