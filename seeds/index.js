const mongoose = require("mongoose");
const Campground = require("../model/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("seeds Connection Open");
  })
  .catch((err) => {
    console.log("seeds connection Error");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const randomNum = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      owner: "65b7dcefa84aca1a605b78a5",
      location: `${cities[randomNum].city}, ${cities[randomNum].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, voluptate. Quasi, quae. Quisquam, voluptates. Quam, quibusdam. Quisquam, voluptates. Quam, quibusdam.",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[randomNum].longitude, cities[randomNum].latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dwn3n5zdb/image/upload/v1706956292/YelpCamp/t9y21gl4th3xrwzeoljt.jpg",
          filename: "YelpCamp/t9y21gl4th3xrwzeoljt",
        },
        {
          url: "https://res.cloudinary.com/dwn3n5zdb/image/upload/v1706733425/YelpCamp/rp5igwqvsletrvamgtrb.jpg",
          filename: "YelpCamp/rp5igwqvsletrvamgtrb",
        },
      ],
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
