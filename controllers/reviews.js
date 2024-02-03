const Review = require("../model/reviews");
const Campground = require("../model/campground");
exports.reviewPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body);
    campground.reviews.push(review);
    review.owner = req.user._id;
    await campground.save();
    await review.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${id}`);
  } catch (err) {
    next(err);
  }
};

exports.Delete = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: req.params.reviewId },
    });

    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash("success", "Successfully deleted review!");
    res.redirect(`/campgrounds/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};
