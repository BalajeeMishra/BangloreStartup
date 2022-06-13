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
const passport = require("passport");
const LocalStrategy = require("passport-local");
const fs = require("fs");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/new_project";
const { uploadVideo } = require("./cloudinary/index");
const Webinar = require("./routes/detailofwebinar");
const Portfolio = require("./routes/portfolio");
const AdminDashboard = require("./routes/admin_dashboard");
const WebinarModel = require("./models/webinar.js");
const AddPrice = require("./routes/add_price");
const Cart = require("./routes/cart");
const UserRoute = require("./routes/user");
const User = require("./models/user");
const Payment = require("./routes/payment");
const Pdf_page = require("./routes/dummy");
const SubscribedUser = require("./routes/subscribed_user");
const jwt = require("jsonwebtoken");
const UserDashboard = require("./routes/user_dashboard");
const AppError = require("./controlError/AppError");
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
app.use("/user/dashboard", UserDashboard);
app.use("/payment", Payment);
app.use("/pdf", Pdf_page);
app.use("/subscribeduser", SubscribedUser);
const handleValidationErr = (err) => {
  return new AppError("please fill up all the required field carefully", 400);
};

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") err = handleValidationErr(err);
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
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
  const name = "balajee";
  const email = "bala.44472@gmail.com";
  const password = "balajeemishra";
  const token = jwt.sign(
    { name, email, password },
    process.env.JWT_ACC_ACTIVATE,
    { expiresIn: "1m" }
  );
  var decoded = jwt.decode(token, { complete: true });
  // console.log(decoded.payload.exp);
  // console.log("balajee", decoded);
  // console.log("hello", Date.now());
  // console.log(Math.floor(Date.now() / 1000) + 10 * 60);
  // console.log(token);
  // const date = new Date();
  // console.log(
  //   `Token Generated at:- ${date.getHours()} :${date.getMinutes()} :${date.getSeconds()}`
  // );
  // console.log(
  //   `Token Generated at:- ${date.getHours()} :${
  //     date.getMinutes() + 1
  //   } :${date.getSeconds()}`
  // );
  return res.render("home");
});

app.post("/video/upload", async (req, res) => {
  const response = await uploadVideo("testing.mp4");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("APP IS LISTENING ON PORT " + PORT));
