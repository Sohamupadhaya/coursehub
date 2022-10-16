const isEmpty = require('./isEmpty')

exports.validateCourse = (data)=>{
let errors=[]

if (isEmpty(data.courseName)){
    errors.push("Course Name is not enterd")
  }
if (isEmpty(data.description)){
    errors.push("Description is not enterd")
  }
if (isEmpty(data.category)){
    errors.push("Category is not enterd")
  }
if (isEmpty(data.outcome)){
    errors.push("Outcome is not enterd")
  }
if (isEmpty(data.createdBy)){
    errors.push("CreatedBy is not enterd")
  }


if (isEmpty(data.slides[0].slideNo)){
    errors.push("slideNo is not enterd")
  }
if (isEmpty(data.slides[0].code)){
    errors.push("Code is not enterd")
  }
if (isEmpty(data.slides[0].img)){
    errors.push("Image is not enterd")
  }
  return {
    errors,
    isValid : isEmpty(errors)
  }
}