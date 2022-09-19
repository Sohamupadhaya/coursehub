const express = require("express");
const router = express.Router();

const { createEnroll } = require("../controller/enroll");

router.post("/", createEnroll);

module.exports = router;
