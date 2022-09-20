const express = require("express");
const router = express.Router();

const { createEnroll,getEnrollById,getAllEnroll,editEnroll} = require("../controller/enroll");

router.post("/create/", createEnroll);
router.get("/dislpay/:enrollId/", getEnrollById);
router.get("/enrolls/", getAllEnroll);
router.put("/edit/:enrollId/",editEnroll);

module.exports = router;
