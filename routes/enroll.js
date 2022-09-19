const express = require("express");
const router = express.Router();

const { createEnroll } = require("../controller/enroll");

router.post("/create/", createEnroll);

module.exports = router;
