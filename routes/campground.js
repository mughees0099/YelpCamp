const express = require("express");
const router = express.Router();
const Campground = require("../model/campground");
const { campgroundSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const isLoggedIn = require("../middleware");
const campground = require("../controllers/campground");
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });

const validateCampground = (req, res, next) => {
  const result = campgroundSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

router
  .route("/")
  .get(campground.Index)
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    campground.Create
  );

router.get("/new", isLoggedIn, campground.New);

router
  .route("/:id")
  .get(campground.Show)
  .put(
    isLoggedIn,
    isOwner,
    upload.array("image"),
    validateCampground,
    campground.Update
  )
  .delete(isLoggedIn, isOwner, campground.Delete);

router.get("/:id/edit", isLoggedIn, isOwner, campground.Edit);

module.exports = router;
