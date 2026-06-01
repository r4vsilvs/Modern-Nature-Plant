const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const protect = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "modern-nature-plant/products",
        resource_type: "image",
        transformation: [
          { width: 1400, height: 1050, crop: "fill", quality: "auto", fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

router.post("/", protect, upload.single("image"), async (req, res, next) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: "Cloudinary environment variables are missing" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please choose an image to upload" });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    res.status(201).json({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
