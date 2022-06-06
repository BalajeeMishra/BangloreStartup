const mongoose = require("mongoose");

// const ImageSchema = new mongoose.Schema({
//   url: String,
//   filename: String,
// });
const WebinarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    title: {
      type: String,
    },
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    about: {
      type: String,
    },
    image: {
      type: String,
      // required: [true, "Uploaded file must have a name"],
    },
    duration: {
      type: Number,
    },
    time: {
      type: String,
    },
    id: {
      type: String,
      required: true,
    },
    //   userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    //required timestamp thing,
    types: {
      type: String,
    },
    webinartiming: {
      type: Date,
    },
    advantageous: {
      type: String,
    },
    abouttopic: {
      type: String,
    },
    bestfor: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);
WebinarSchema.index({ title: "text", name: "text", description: "text" });
module.exports = mongoose.model("Webinar", WebinarSchema);
