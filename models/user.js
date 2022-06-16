const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  // username is basically email of user.
  username: {
    type: String,
    unique: [true, "Username should be unique."],
  },
  // token for verification purpose.
  token: {
    type: String,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  jobtitle: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  industry: [String],
})

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", UserSchema)
