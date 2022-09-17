var mongoose = require('mongoose');
const {ObjectId} = require('../models/User')
const {ObjectId} = require('../models/Course')
const enroll = new mongoose.Schema({
    course:{
        type: ObjectId,
        ref:"Course",
        required: true
    }, //id
    userId:{
        type: ObjectId,
        ref:"User",
        required: true
    },
    completed:{
        type:Boolean,
        default: false
    }, // boolean
progress:[{
slideNo:{
    type:Number,
    required:true
},
visited:{
    type:false
}, // boolean
enteredCode:{
    type:String,
    required:true
}
}]
},{timestamps:true})

module.exports = mongoose.model('Enroll',enroll)