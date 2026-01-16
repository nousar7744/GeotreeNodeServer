import mongoose from "mongoose";

const UserShema = new mongoose.Schema({
    username:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:false
    },
    privacy_policy:{
        type:Boolean,
        required:false,
        default:false
    },
    password:{
        type:String,
        required:false
    },
    token:{
        type:String,
        required:false
    },
    device_token:{
        type:String,
        required:false
    },
    mobile: {
        type: Number,
        required: true
    },
    email_verified:{
        type:Boolean,
        required:false,
        default:false
    },
    number_verified:{
        type:Boolean,
        required:false,
        default:false
    },
   
    otp:{
        type:Number,
        required: false 
    },
    amount:{
        type:Number,
        required:false,
        default:0
    },
    name: {
        type: String,
        required: false
    },
    profile_image: {
        type: String,
        required: false
    }
   
})
const User = mongoose.model("users", UserShema);
export default User;