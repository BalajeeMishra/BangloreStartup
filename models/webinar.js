const mongoose = require("mongoose");
const WebinarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    title: {
      type: String,
    },
    // category is basically type of Industry.
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
    // duration of webinar or seminar.
    duration: {
      type: Number,
    },
    // timing of webinar.
    time: {
      type: String,
    },
    // Agenda,In case of seminar only
    agenda: {
      type: String,
    },
    types: {
      type: String,
    },
    // date of webinar.
    webinartiming: {
      type: Date,
    },
    // Why Should You Attend
    advantageous: {
      type: String,
    },
    // Areas Covered in the Webinar
    abouttopic: {
      type: String,
    },
    // Who Will Benefit
    bestfor: {
      type: String,
    },
    // statust is just live and recording thing.
    status: {
      type: String,
    },
    // just the name of pdf.
    pdf_path: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
    },
    seotitle: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

WebinarSchema.index({ title: "text", name: "text", description: "text" });

module.exports = mongoose.model("Webinar", WebinarSchema);
