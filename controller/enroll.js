const express = require('express')
const Enroll = require('../models/Enroll')

exports.createEnroll = async (req,res) =>{
    try{
        const allEnrolls = {
            course: req.body.course,
            userId: req.body.userId,
            progress:[]
        }
        for(let[index,value] of req.body.progress.entries()){
            dataProgress = {}
            dataProgress.slideNo = value.slideNo;
            dataProgress.enteredCode = value.enteredCode;
            allEnrolls.progress.push(dataProgress);
        }
        const Enrolls = new Enroll(allEnrolls)
        createEnroll = Enrolls.save()
        res.json(allEnrolls)
    }
    catch(err){
        console.log(err);
        res.send("error");
    }
}