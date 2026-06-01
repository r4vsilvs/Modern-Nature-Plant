const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    priceText: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    careLevel: {
      type: String,
      enum: ["Easy", "Moderate", "Expert"],
      default: "Easy"
    },
    light: {
      type: String,
      trim: true,
      default: "Bright indirect light"
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
