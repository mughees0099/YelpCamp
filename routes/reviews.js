const express = require("express");
const router = express.Router({ mergeParams: true });
const { reviewSchema } = require("../schema.js");
const Review = require("../model/reviews");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../model/campground");
const isLoggedIn = require("../middleware");
const review = require("../controllers/reviews");

const validateReview = (req, res, next) => {
  const result = reviewSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
const isReviewOwner = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

router.post("/", isLoggedIn, validateReview, review.reviewPost);
router.delete("/:reviewId", isLoggedIn, isReviewOwner, review.Delete);

module.exports = router;
