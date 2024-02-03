const baseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => {
  return {
    type: "string",
    base: joi.string(),
    messages: {
      "string.escapeHTML": "{{#label}} must not include HTML tags!",
    },
    rules: {
      escapeHTML: {
        validate(value, helpers) {
          const clean = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
          });
          if (clean !== value)
            return helpers.error("string.escapeHTML", { value });
          return clean;
        },
      },
    },
  };
};

const Joi = baseJoi.extend(extension);

(module.exports.campgroundSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
  price: Joi.number().required().min(1),
  // image: Joi.string().required(),
  location: Joi.string().required().escapeHTML(),
  description: Joi.string().required().escapeHTML(),
  deleteImages: Joi.array(),
}).required()),
  (module.exports.reviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    review: Joi.string().required().escapeHTML(),
  }).required());
