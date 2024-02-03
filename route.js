if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user");
const isLoggedIn = require("./middleware");
const Campground = require("./model/campground");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");

const app = express();
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Mongo Connection Open");
  })
  .catch((err) => {
    console.log("Mongo Connection Error");
    console.log(err);
  });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
const secret = process.env.SECRET || "thisisnotagoodsecret";
const store = new MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});
store.on("error", function (e) {
  console.log("Session Store Error", e);
});
app.use(
  session({
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js",
  "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js",
  "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js",
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dwn3n5zdb/",
        "https://images.unsplash.com/",
      ],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.isUserLoggedIn = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.get("/mycampgrounds", isLoggedIn, async (req, res) => {
  const campground = await Campground.find({ owner: req.user._id }).populate(
    "owner"
  );

  res.render("campgrounds/mycampgrounds", {
    campground,
    username: req.user.username,
  });
});
app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong";

  res.status(status).render("error", { err });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
