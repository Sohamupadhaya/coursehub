const Errormessage = {
    idNotFound: "Id Not Found",
    incorrectPassword: "Incorrect Password",
    recordNotFound: "No Record Found",
    TokenExpiredError: "Token Expired",
    JsonWebTokenError: "Invalid Token",
    InternalServerError: "Internal Server Error",
    EmailExist: "Email Address Already Exist",
    AccountNotVerified: "Your Account is not Verified",
    EmailIdPasswordIncorrect: "Invalid Email or Password",
    roleExist: "Role Already Exist",
    accessDenied: 'Access Denied: You dont have correct privilege to perform this operation',
    SocialTypeRequired: "Social type is required",
    GoogleTokenNotValid: "Google token is not valid",
    AccountNotExist: "Account does not exist",
    InvalidLogin: "Invalid Login",
    PhoneNumberExist: "Contact Number already exist",
    CustomerNameExist: "Customer Name already exist",
    RoleNotFound: "Role not found",
}
const message = {
    requestSuccess: "Request successful",
    recordDelete: "Record Deleted Successfully",
    recordUpdated: "Record Updated Successfully",
    emailSent: "Email Sent",
    verificationEmail: "Verification Email Sent",
    validToken: "Token is valid",
    loginSuccess: "Login successful",
    passwordUpdated: "Password Update successful",
    accVerified: "Account Verified",
    recordAdded: "Record Added Successfully",

}

const RegisteredWith = {
    GOOGLE: "google",
    FACEBOOK: "facebook",
    LINKEDIN: "linkedin",
    TWITTER: "twitter",
    GITHUB: "github",
    EMAIL: "email"
}

// Add permission for auth guard
const permissions = [
    "READ_ENTITY",
]

module.exports = {
    Errormessage: Errormessage,
    message: message,
    RegisteredWith: RegisteredWith,
}

