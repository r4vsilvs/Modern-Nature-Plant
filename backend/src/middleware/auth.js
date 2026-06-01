const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Admin authorization required" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.admin = jwt.verify(token, process.env.JWT_SECRET || "modern-nature-dev-secret");
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired admin session" });
  }
};

module.exports = protect;
