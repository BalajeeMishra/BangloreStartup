const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
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
  username: {
    type: String,
    unique: [true, "Username should be unique."],
  },
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
    type: Number,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  jobtitle: {
    type: String,
    required: true,
  },
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
