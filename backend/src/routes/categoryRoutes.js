const express = require("express");
const Category = require("../models/Category");
const Product = require("../models/Product");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    next(error);
  }
});

router.put("/:id", protect, async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const oldName = existingCategory.name;
    existingCategory.name = name;
    await existingCategory.save();

    if (oldName !== name) {
      await Product.updateMany({ category: oldName }, { category: name });
    }

    res.json(existingCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
