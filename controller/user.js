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
