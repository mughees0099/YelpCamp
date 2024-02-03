const Campground = require("../model/campground");
const { cloudinary } = require("../cloudinary/index");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });
exports.Index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

exports.New = (req, res) => {
  try {
    res.render("campgrounds/new");
  } catch (err) {
    next(err);
  }
};

exports.Create = async (req, res, next) => {
  try {
    const geoData = await geoCoder
      .forwardGeocode({
        query: req.body.location,
        limit: 1,
      })
      .send();
    const newCampground = new Campground(req.body);
    newCampground.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    if (!geoData.body.features[0]) {
      req.flash("error", "Invalid address");
      return res.redirect("/campgrounds/new");
    } else {
      newCampground.geometry = geoData.body.features[0].geometry;
      newCampground.owner = req.user._id;
      await newCampground.save();
      // console.log(newCampground);
      req.flash("success", "Successfully made a new campground!");

      res.redirect(`/campgrounds/${newCampground._id}`);
    }
  } catch (err) {
    next(err);
  }
};

exports.Show = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "owner",
        },
      })
      .populate("owner");
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    } else {
      res.render("campgrounds/show", { campground });
    }
  } catch (err) {
    next(err);
  }
};

exports.Edit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground });
  } catch (err) {
    next(err);
  }
};

exports.Update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        runValidators: true,
        new: true,
      }
    );
    const newImages = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        try {
          await cloudinary.uploader.destroy(filename);
        } catch (error) {
          console.error(`Failed to delete image ${filename}:`, error);
        }
      }
      await camp.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    camp.images.push(...newImages);

    await camp.save();
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${camp._id}`);
  } catch (err) {
    next(err);
  }
};

exports.Delete = async (req, res) => {
  try {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
  } catch (err) {
    next(err);
  }
};
