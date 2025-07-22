const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
// passport-local-mongoose will add a username, hash and salt field to store the username, the hashed password and salt value 
const userSchema = new Schema({
    email:{
        type:String,
        required: true,
    },
})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User",userSchema);
module.exports = User;