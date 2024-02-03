const { string } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  review: String,
  rating: Number,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("Review", reviewSchema);
