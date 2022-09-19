const User = require('../models/User')

exports.getUserById = async (req,res)=>{
    try{
        const UserById = await User.findOne({_id: req.params.userId})
        if(!UserById){
            return res.status(400).json({"message":"User could not be found"})
        }
        res.json(UserById)
    }
    catch(err){
        console.log(err);
        res.send(err)
    }
}

exports.getAllUser = async (req,res)=>{
    try{
    const allUsers = await User.find();
    if(allUsers.length === 0){
        return res.status(204).json({"message":"No Content is Available"})
    }
    res.json(allUsers)
    }
    catch(err){
        console.log(err);
        res.send("error")
    }
}