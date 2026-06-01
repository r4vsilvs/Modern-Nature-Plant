const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/db");
const Admin = require("./src/models/Admin");
const Product = require("./src/models/Product");
const Category = require("./src/models/Category");

dotenv.config();

const products = [
  {
    name: "Monstera Deliciosa",
    category: "Indoor Statement Plant",
    priceText: "From Rs. 4,500",
    description: "Broad split leaves with a bold tropical shape, perfect for living rooms, lobbies, and sunlit corners.",
    careLevel: "Easy",
    light: "Bright filtered light",
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=85",
    featured: true
  },
  {
    name: "Fiddle Leaf Fig",
    category: "Premium Indoor Plant",
    priceText: "From Rs. 6,800",
    description: "A sculptural favorite with glossy violin-shaped leaves that brings instant height and elegance.",
    careLevel: "Moderate",
    light: "Bright indirect light",
    imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a207c8a?auto=format&fit=crop&w=1200&q=85",
    featured: true
  },
  {
    name: "Snake Plant",
    category: "Low Maintenance Plant",
    priceText: "From Rs. 2,200",
    description: "Architectural upright leaves, excellent resilience, and a clean modern look for desks and bedrooms.",
    careLevel: "Easy",
    light: "Low to bright indirect light",
    imageUrl: "https://images.unsplash.com/photo-1593482892290-f54927ae2b7d?auto=format&fit=crop&w=1200&q=85",
    featured: false
  },
  {
    name: "Peace Lily",
    category: "Flowering Indoor Plant",
    priceText: "From Rs. 2,900",
    description: "Soft white blooms and lush green leaves for calm interiors, reception areas, and gifting.",
    careLevel: "Easy",
    light: "Medium indirect light",
    imageUrl: "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=1200&q=85",
    featured: true
  },
  {
    name: "Areca Palm",
    category: "Airy Floor Plant",
    priceText: "From Rs. 5,500",
    description: "Feathery palm fronds that soften spaces and create a resort-like natural atmosphere indoors.",
    careLevel: "Moderate",
    light: "Bright indirect light",
    imageUrl: "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=1200&q=85",
    featured: false
  },
  {
    name: "ZZ Plant",
    category: "Hardy Indoor Plant",
    priceText: "From Rs. 3,200",
    description: "Deep green glossy leaves with outstanding tolerance for low light and busy plant owners.",
    careLevel: "Easy",
    light: "Low to medium indirect light",
    imageUrl: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=1200&q=85",
    featured: false
  }
];

const seed = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@modernnatureplant.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { email },
    { email, password: hashedPassword },
    { upsert: true, new: true }
  );

  await Product.deleteMany({});
  await Product.insertMany(products);
  await Category.deleteMany({});
  await Category.insertMany([...new Set(products.map((product) => product.category))].map((name) => ({ name })));

  console.log("Seed complete");
  console.log(`Admin email: ${email}`);
  console.log(`Admin password: ${password}`);
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
