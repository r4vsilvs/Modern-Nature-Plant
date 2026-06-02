const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./src/config/db");
const productRoutes = require("./src/routes/productRoutes");
const authRoutes = require("./src/routes/authRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().catch(() => {
  console.log("Start MongoDB and check MONGO_URI before using database routes.");
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Modern Nature Plant API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Something went wrong"
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
