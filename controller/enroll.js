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

exports.getEnrollById = async (req, res) =>{
    try{

        const getEnroll = await Enroll.findById(req.params.enrollId);
        if(!getEnroll){
            res.status(404).json({"message":"No Id was Found"})
        }
        res.json(getEnroll)
    }
    catch (err) {
        console.log(err);
        res.send("Error")
    }
}

exports.getAllEnroll = async (req, res) =>{
    try{
        const allEnrolls = await Enroll.find();
        if (allEnrolls.length <= 0){
            res.json({"message":"No Data In  DataBase"});
        }
        res.json(allEnrolls)
    }
    catch (err) {
        console.log(err);
        res.send("Error")
    }
}

exports.editEnroll = async (req, res) =>{
    try{
        const getEnroll = await Enroll.findById({_id:req.params.enrollId});
        if(!getEnroll){
            return res.status(404).json({"message":"No Id was Found"})
        }
        allUpdateEnroll = {
            course:req.body.course,
            userId:req.body.userId,
            progress:[]
        }
        for (let[index,value] of req.body.progress.entries()){
            progressData={}
            progressData.slideNo = value.slideNo;
            progressData.enteredCode = value.enteredCode;
            allUpdateEnroll.progress.push(progressData)
        }
        console.log(allUpdateEnroll);
        const updateEnroll = await Enroll.findByIdAndUpdate({_id:req.params.enrollId},
            {$set:allUpdateEnroll},
            { new: true, upsert: true }
            );
        if(!updateEnroll){
            return res.status(400).json({"message":"Problem in update"})
        }
        res.json(updateEnroll)
    }
    catch (err) {
        console.log(err);
        res.send("Error")
    }
}