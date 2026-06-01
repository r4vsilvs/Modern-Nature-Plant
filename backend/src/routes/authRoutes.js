const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const matches = await bcrypt.compare(password, admin.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || "modern-nature-dev-secret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      admin: {
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
