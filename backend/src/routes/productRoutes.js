const express = require("express");
const Product = require("../models/Product");
const protect = require("../middleware/auth");

const router = express.Router();

const normalizeProductImages = (body) => {
  const images = Array.isArray(body.images)
    ? body.images.map((image) => String(image).trim()).filter(Boolean).slice(0, 4)
    : [];
  const imageUrl = String(body.imageUrl || images[0] || "").trim();

  return {
    ...body,
    imageUrl,
    images: imageUrl ? [imageUrl, ...images.filter((image) => image !== imageUrl)].slice(0, 4) : images
  };
};

const withImagesArray = (product) => {
  const data = product.toObject ? product.toObject() : product;
  const images = Array.isArray(data.images) ? data.images : [];
  const imageList = [data.imageUrl, ...images]
    .filter(Boolean)
    .filter((image, index, list) => list.indexOf(image) === index)
    .slice(0, 4);

  return {
    ...data,
    imageUrl: imageList[0] || data.imageUrl,
    images: imageList
  };
};

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ featured: -1, createdAt: -1 });
    res.json(products.map(withImagesArray));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(withImagesArray(product));
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const product = await Product.create(normalizeProductImages(req.body));
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", protect, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, normalizeProductImages(req.body), {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
