if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const cloudinary = require("cloudinary");
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const fs = require("fs");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/new_project";
const { upload, uploadVideo } = require("./cloudinary/index");
const Webinar = require("./routes/detailofwebinar");
const Portfolio = require("./routes/portfolio");
const AdminDashboard = require("./routes/admin_dashboard");
const WebinarModel = require("./models/webinar.js");
const AddPrice = require("./routes/add_price");
const Cart = require("./routes/cart");
const UserRoute = require("./routes/user");
const User = require("./models/user");
const Payment = require("./routes/payment");
mongoose
  .connect(dbUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connection open");
  })
  .catch((err) => {
    console.error(err);
  });
// const collections = Object.keys(mongoose.connection.collections);
// console.log(collections[0]);
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);
app.use(express.json());
const store = new MongoDBStore({
  mongoUrl: dbUrl,
  secret: "thisshouldbeabettersecret!",
  touchAfter: 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});
const sessionConfig = {
  store,
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    User.authenticate()
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  req.session.count = 1;
  res.locals.gotmail = req.session.count;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
app.use("/webinar", Webinar);
app.use("/portfolio", Portfolio);
app.use("/admin", AdminDashboard);
app.use("/price", AddPrice);
app.use("/cart", Cart);
app.use("/user", UserRoute);
app.use("/payment", Payment);
const handleValidationErr = (err) => {
  return new AppError("please fill up all the required field carefully", 400);
};

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") err = handleValidationErr(err);
  next(err);
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (err) {
    res.status(statusCode).render("error", { err });
  }
});

app.get("/", async (req, res) => {
  const webinar = await WebinarModel.find({});
  webinar.sort(function (a, b) {
    var dateA = new Date(a.webinartiming),
      dateB = new Date(b.webinartiming);
    return dateA - dateB;
  });
  // console.log(webinar.reverse()); //array is now sorted by date
  res.render("home");
});

app.post("/video/upload", async (req, res) => {
  // Get the file name and extension with multer
  const response = await uploadVideo("NOW.mp4");
  console.log("balajee", response);
  return res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("APP IS LISTENING ON PORT");
});

// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     const fileExt = file.originalname.split(".").pop();
//     const filename = `${new Date().getTime()}.${fileExt}`;
//     cb(null, filename);
//   },
// });

// // Filter the file to validate if it meets the required video extension
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "video/mp4") {
//     cb(null, true);
//   } else {
//     cb(
//       {
//         message: "Unsupported File Format",
//       },
//       false
//     );
//   }
// };

// // Set the storage, file filter and file size with multer
// const upload = multer({
//   storage,
//   limits: {
//     fieldNameSize: 200,
//     fileSize: 30 * 1024 * 1024,
//   },
//   fileFilter,
// }).single("video");

// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET,
// });
// cloudinary.v2.uploader.upload(
//   "now.mp4",
//   {
//     resource_type: "video",
//     public_id: "myfolder/mysubfolder/my_dog",
//     overwrite: true,
//     notification_url: "https://mysite.example.com/notify_endpoint",
//   },
//   function (error, result) {
//     console.log(result, error);
//   }
// );

// cloudinary.v2.uploader.upload_large(
//   "now.mp4",
//   {
//     resource_type: "video",
//     public_id: "myfolder/mysubfolder/dog_closeup",
//     chunk_size: 6000000,
//     eager: [
//       { width: 300, height: 300, crop: "pad", audio_codec: "none" },
//       {
//         width: 160,
//         height: 100,
//         crop: "crop",
//         gravity: "south",
//         audio_codec: "none",
//       },
//     ],
//     eager_async: true,s
//     eager_notification_url: "https://mysite.example.com/notify_endpoint",
//   },
//   function (error, result) {
//     console.log(result, error);
//   }
// );
