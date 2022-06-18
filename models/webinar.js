const mongoose = require("mongoose")
const WebinarSchema = new mongoose.Schema(
  {
    //name of instructor
    name: {
      type: String,
    },
    //bascially name of webinar and seminar.
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
      url: {
        type: String,
        default:
          "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
      },
      filename: String,
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
    liveLink: {
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
    archive: {
      type: Boolean,
      default: false,
    },
    showingDate: {
      type: String,
    },
    // storing in 12-02-2022 format.
    dateforSort: {
      type: String,
    },
    addtimingineastern: {
      type: String,
    },
    addtiminginpacific: {
      type: String,
    },
    visibility: {
      type: Boolean,
      default: false,
    },
    // for refering a portfolio.
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portfolio",
    },
    // adding id for showing on user interface.
    webinarId: {
      type: Number,
      default: 108,
    },
    // in case of recorded only.
    urlofseminar: {
      type: String,
    },
  },
  { timestamps: true }
)

WebinarSchema.index({ title: "text", name: "text", description: "text" })

module.exports = mongoose.model("Webinar", WebinarSchema)
