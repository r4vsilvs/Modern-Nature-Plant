import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Droplets,
  Eye,
  Facebook,
  Filter,
  Instagram,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  PenLine,
  Phone,
  Search,
  Sparkles,
  Sprout,
  Star,
  SunMedium,
  Trash2,
  X
} from "lucide-react";
import { api } from "./api";
import logo from "./assets/modern-nature-logo.jpg";

const emptyForm = {
  name: "",
  category: "",
  priceText: "",
  description: "",
  careLevel: "Easy",
  light: "",
  imageUrl: "",
  images: [],
  featured: false,
  inStock: true
};

const careLevelLabels = {
  Easy: "Easy - Low maintenance",
  Moderate: "Moderate - Needs regular care",
  Expert: "Expert - Requires special care"
};

const getProductImages = (product) => {
  const images = Array.isArray(product?.images) ? product.images : [];
  return [product?.imageUrl, ...images].filter(Boolean).filter((image, index, list) => list.indexOf(image) === index).slice(0, 4);
};

const fallbackProducts = [
  {
    _id: "sample-1",
    name: "Monstera Deliciosa",
    category: "Indoor Statement Plant",
    priceText: "From Rs. 4,500",
    description: "Broad split leaves with a bold tropical shape, perfect for living rooms, lobbies, and sunlit corners.",
    careLevel: "Easy",
    light: "Bright filtered light",
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=85",
    images: ["https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=85"],
    featured: true,
    inStock: true
  },
  {
    _id: "sample-2",
    name: "Fiddle Leaf Fig",
    category: "Premium Indoor Plant",
    priceText: "From Rs. 6,800",
    description: "Glossy violin-shaped leaves that bring instant height and elegance to modern interiors.",
    careLevel: "Moderate",
    light: "Bright indirect light",
    imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a207c8a?auto=format&fit=crop&w=1200&q=85",
    images: ["https://images.unsplash.com/photo-1597055181300-e3633a207c8a?auto=format&fit=crop&w=1200&q=85"],
    featured: true,
    inStock: true
  },
  {
    _id: "sample-3",
    name: "Snake Plant",
    category: "Low Maintenance Plant",
    priceText: "From Rs. 2,200",
    description: "Architectural upright leaves, excellent resilience, and a clean modern look.",
    careLevel: "Easy",
    light: "Low to bright indirect light",
    imageUrl: "https://images.unsplash.com/photo-1593482892290-f54927ae2b7d?auto=format&fit=crop&w=1200&q=85",
    images: ["https://images.unsplash.com/photo-1593482892290-f54927ae2b7d?auto=format&fit=crop&w=1200&q=85"],
    featured: false,
    inStock: true
  }
];

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [managedCategories, setManagedCategories] = useState([]);
  const [route, setRoute] = useState(window.location.pathname);
  const [activeSection, setActiveSection] = useState(window.location.hash.replace("#", "") || "home");
  const [token, setToken] = useState(localStorage.getItem("mnp_token") || "");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(productData);
      setManagedCategories(categoryData);
    } catch (error) {
      setProducts(fallbackProducts);
      setManagedCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const onPop = () => {
      setRoute(window.location.pathname);
      setActiveSection(window.location.hash.replace("#", "") || "home");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (route !== "/") return undefined;

    const sectionIds = ["home", "collection", "about", "contact"];
    const onScroll = () => {
      const activationLine = Math.min(window.innerHeight * 0.6, 560);
      const current = sectionIds.findLast((id) => {
        const element = document.getElementById(id);
        return element && element.getBoundingClientRect().top <= activationLine;
      });
      if (current) setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [route]);

  const navigate = (path, targetId) => {
    window.history.pushState({}, "", targetId ? `${path}#${targetId}` : path);
    setRoute(path);
    setActiveSection(targetId || (path === "/" ? "home" : ""));

    if (targetId) {
      setTimeout(() => {
        const target = document.getElementById(targetId);
        const header = document.querySelector(".site-header");
        if (!target) return;

        const headerOffset = (header?.offsetHeight || 0) + 18;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: Math.max(targetPosition, 0), behavior: "smooth" });
      }, 80);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = useMemo(() => ["All", ...new Set(products.map((product) => product.category))], [products]);
  const filteredProducts = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.priceText,
        product.careLevel,
        careLevelLabels[product.careLevel],
        product.light,
        product.inStock ? "in stock" : "out of stock"
      ].join(" ").toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, query, category]);
  const featuredProducts = useMemo(() => products.filter((product) => product.featured), [products]);
  const homeProducts = useMemo(() => {
    const selected = featuredProducts.length ? featuredProducts : products;
    return selected.slice(0, 4);
  }, [featuredProducts, products]);
  const plantId = route.startsWith("/plants/") ? decodeURIComponent(route.replace("/plants/", "")) : "";
  const selectedPlant = plantId ? products.find((product) => product._id === plantId) : null;

  if (route === "/admin") {
    return (
      <AdminDashboard
        token={token}
        setToken={setToken}
        products={products}
        categories={managedCategories}
        reload={loadProducts}
        navigate={navigate}
      />
    );
  }

  if (route === "/plants") {
    return (
      <main>
        <Header navigate={navigate} route={route} activeSection={activeSection} />
        <PlantsPage
          products={filteredProducts}
          categories={categories}
          category={category}
          setCategory={setCategory}
          query={query}
          setQuery={setQuery}
          loading={loading}
          navigate={navigate}
        />
        <Contact />
        <Footer navigate={navigate} />
      </main>
    );
  }

  if (route.startsWith("/plants/")) {
    return (
      <main>
        <Header navigate={navigate} route={route} activeSection={activeSection} />
        <PlantDetail product={selectedPlant} loading={loading} navigate={navigate} />
        <FeaturedStrip products={(featuredProducts.length ? featuredProducts : products).filter((product) => product._id !== plantId).slice(0, 3)} navigate={navigate} />
        <Contact />
        <Footer navigate={navigate} />
      </main>
    );
  }

  return (
    <main>
      <Header navigate={navigate} route={route} activeSection={activeSection} />
      <Hero navigate={navigate} />
      <HomePlantPreview
        products={homeProducts}
        hasFeatured={featuredProducts.length > 0}
        loading={loading}
        navigate={navigate}
      />
      <About />
      <Contact />
      <Footer navigate={navigate} />
    </main>
  );
}

function Header({ navigate, route, activeSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const goTo = (path, targetId) => {
    setMobileMenuOpen(false);
    navigate(path, targetId);
  };

  return (
    <header className="site-header" id="home">
      <button className="mobile-icon-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
        <Menu size={24} />
      </button>
      <button className="brand nav-brand" onClick={() => navigate("/")} aria-label="Modern Nature Plant home">
        <span className="brand-mark logo-mark"><img src={logo} alt="" /></span>
        <span className="brand-text"><strong>Modern Nature</strong><small>Plant</small></span>
      </button>
      <nav className="main-nav" aria-label="Primary navigation">
        <button className={`nav-link ${route === "/" && activeSection === "home" ? "active" : ""}`} onClick={() => navigate("/")}>Home</button>
        <button className={`nav-link ${route.startsWith("/plants") ? "active" : ""}`} onClick={() => navigate("/plants")}>Plants</button>
        <button className={`nav-link ${route === "/" && activeSection === "about" ? "active" : ""}`} onClick={() => navigate("/", "about")}>About</button>
        <button className={`nav-link ${route === "/" && activeSection === "contact" ? "active" : ""}`} onClick={() => navigate("/", "contact")}>Contact</button>
      </nav>
      <button className="nav-cta" onClick={() => navigate("/", "contact")}>Inquire now</button>
      <span className="mobile-header-spacer" aria-hidden="true" />

      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-drawer-bar">
          <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={26} /></button>
          <img src={logo} alt="Modern Nature Plant logo" />
          <span aria-hidden="true" />
        </div>
        <div className="mobile-drawer-links">
          <button onClick={() => goTo("/")}>Home</button>
          <button onClick={() => goTo("/plants")}>Plants</button>
          <button onClick={() => goTo("/plants")}>Categories</button>
          <button onClick={() => goTo("/", "about")}>About</button>
          <button onClick={() => goTo("/", "contact")}>Contact</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ navigate }) {
  return (
    <section className="hero">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> Modern Nature Plant</p>
          <h1>
            <span>Bring home</span>
            <span className="hero-highlight">fresh green calm.</span>
          </h1>
          <p>
            Fresh indoor and outdoor plants selected for homes, offices,
            cafes, and thoughtful green gifts in Sri Lanka.
          </p>
          <div className="hero-promise">
            <span>Indoor plants</span>
            <span>Outdoor greenery</span>
            <span>Green gifting</span>
          </div>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => navigate("/plants")}>
              Browse plants <ArrowUpRight size={18} />
            </button>
            <button className="secondary-action" onClick={() => navigate("/", "contact")}>
              Contact us
            </button>
          </div>
        </div>
        <div className="hero-showcase" aria-label="Plant showroom photo">
          <img
            src="https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1500&q=92"
            alt="Styled indoor plants in a modern room"
          />
          <div className="hero-showcase-card">
            <span>Modern Nature</span>
            <strong>Selected greenery for refined spaces</strong>
            <p>Elegant plants for homes, offices, cafes, and thoughtful gifting.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePlantPreview({ products, hasFeatured, loading, navigate }) {
  return (
    <section className="section collection home-preview" id="collection">
      <div className="featured-editorial">
        <p className="eyebrow"><Star size={16} /> Featured products</p>
        <div className="featured-editorial-grid">
          <h2>{hasFeatured ? "Handpicked greenery for calm, stylish rooms." : "A fresh preview from our plant collection."}</h2>
          <p>
            A refined selection chosen for beautiful homes, workspaces, cafes, and thoughtful green gifts.
            Explore the full catalog when you want more options.
          </p>
        </div>
        <div className="featured-line" aria-label="Featured product highlights">
          <span>Fresh selected plants</span>
          <span>Care details included</span>
          <span>Direct availability inquiry</span>
        </div>
      </div>

      {loading ? (
        <div className="status-panel">Loading plants...</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} navigate={navigate} />
          ))}
        </div>
      )}

      <div className="center-action">
        <button className="primary-action" onClick={() => navigate("/plants")}>
          View all plants <ArrowUpRight size={18} />
        </button>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-copy">
        <p className="eyebrow"><Eye size={16} /> About Modern Nature Plant</p>
        <h2>Curated greenery for calm, beautiful interiors.</h2>
        <p>
          Modern Nature Plant brings together elegant plants, thoughtful care
          details, and a simple way to choose greenery for homes, offices,
          cafes, and meaningful gifts.
        </p>
        <div className="about-points">
          <span><BadgeCheck size={18} /> Carefully selected plants with clear availability</span>
          <span><BadgeCheck size={18} /> Styling-friendly choices for homes and workspaces</span>
          <span><BadgeCheck size={18} /> Direct support before customers choose a plant</span>
        </div>
      </div>
      <div className="about-visual">
        <div className="about-image" />
        <div className="about-card">
          <span>01</span>
          <strong>Premium Plant Display</strong>
          <p>Browse curated plants with photos, care level, light needs, and stock status.</p>
        </div>
      </div>
      <div className="about-stats">
        <span><strong>Fresh</strong> selected plants</span>
        <span><strong>Direct</strong> call or WhatsApp</span>
        <span><strong>Simple</strong> no checkout flow</span>
      </div>
    </section>
  );
}

function PlantHighlights() {
  return (
    <section className="catalog-benefits" aria-label="Shop highlights">
      <span><Sprout size={18} /> Selected greenery</span>
      <span><Leaf size={18} /> Indoor and outdoor plants</span>
      <span><Droplets size={18} /> Care details included</span>
      <span><BadgeCheck size={18} /> Direct inquiry only</span>
    </section>
  );
}

function PlantsPage({ products, categories, category, setCategory, query, setQuery, loading, navigate }) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const chooseCategory = (item) => {
    setCategory(item);
    setFiltersOpen(false);
  };

  return (
    <section className="section collection plants-page" id="collection">
      <div className="catalog-hero">
        <div className="catalog-hero-grid">
          <div className="catalog-hero-copy">
            <p className="eyebrow"><Leaf size={16} /> Full collection</p>
            <h2>Find the right greenery for your space.</h2>
            <p>
              Browse our displayed plants, compare care needs, and contact Modern Nature Plant directly for availability.
            </p>
          </div>
          <aside className="catalog-summary" aria-label="Catalog summary">
            <p className="catalog-kicker">Display catalog</p>
            <strong>Premium plants, clearly presented.</strong>
            <div className="catalog-promise-list">
              <span>Clear product photos</span>
              <span>Care and light details</span>
              <span>Availability before inquiry</span>
            </div>
          </aside>
        </div>

        <PlantHighlights />
      </div>

      <div className="catalog-tools">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by plant, type, or care"
          />
        </label>
        <button
          type="button"
          className={`filter-label ${filtersOpen ? "active" : ""}`}
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <Filter size={17} />
          <small>{category}</small>
          <ChevronDown size={16} />
        </button>
        <div className={`category-row filter-menu ${filtersOpen ? "open" : ""}`}>
          {categories.map((item) => (
            <button
              key={item}
              className={item === category ? "active" : ""}
              onClick={() => chooseCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="status-panel">Loading plants...</div>
      ) : products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="status-panel">
          <strong>No plants found.</strong>
          <span>Try another category or search word.</span>
        </div>
      )}
    </section>
  );
}

function FeaturedStrip({ products, navigate }) {
  if (!products.length) return null;

  return (
    <section className="featured-strip" aria-label="Featured plants">
      <div className="featured-copy">
        <p className="eyebrow"><Star size={16} /> Featured picks</p>
        <h2>Popular plants for modern rooms.</h2>
      </div>
      <div className="featured-list">
        {products.slice(0, 3).map((product) => (
          <article key={product._id} className="featured-mini" onClick={() => navigate(`/plants/${encodeURIComponent(product._id)}`)}>
            <img src={getProductImages(product)[0] || product.imageUrl} alt={product.name} />
            <div>
              <strong>{product.name}</strong>
              <span>{product.priceText || "Contact for price"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, navigate }) {
  const productImages = getProductImages(product);
  const [previewIndex, setPreviewIndex] = useState(0);
  const canPreview = product.featured && productImages.length > 1;
  const mainImage = productImages[previewIndex] || productImages[0] || product.imageUrl;

  useEffect(() => {
    setPreviewIndex(0);
  }, [product._id]);

  return (
    <article
      className={`product-card ${canPreview ? "preview-enabled" : ""}`}
      onMouseEnter={() => {
        if (canPreview) setPreviewIndex(1);
      }}
      onMouseLeave={() => {
        setPreviewIndex(0);
      }}
    >
      <div className="product-image">
        <img src={mainImage} alt={product.name} />
        {product.featured && <span className="floating-tag">Featured</span>}
      </div>
      <div className="product-body">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <div className="plant-meta">
          <span><SunMedium size={16} /> {product.light}</span>
          <span><Droplets size={16} /> {careLevelLabels[product.careLevel] || product.careLevel}</span>
        </div>
        <p className="custom-order-note">Custom sizes, pots, and arrangements available by contacting us.</p>
        <div className="product-footer">
          <strong>{product.priceText || "Contact for price"}</strong>
          <span className={product.inStock ? "stock in" : "stock out"}>
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        <button className="details-button" onClick={() => navigate(`/plants/${encodeURIComponent(product._id)}`)}>
          View plant <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}

function PlantDetail({ product, loading, navigate }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?._id]);

  if (loading) {
    return <section className="plant-detail-page"><div className="status-panel">Loading plant...</div></section>;
  }

  if (!product) {
    return (
      <section className="plant-detail-page">
        <div className="status-panel">
          <strong>Plant not found.</strong>
          <span>This plant may have been removed from the catalog.</span>
          <button className="primary-action" onClick={() => navigate("/plants")}>Back to plants</button>
        </div>
      </section>
    );
  }
  const productImages = getProductImages(product);
  const mainImage = productImages[activeImageIndex] || productImages[0] || product.imageUrl;
  const galleryImages = productImages
    .map((image, index) => ({ image, index }))
    .filter((item) => item.index !== activeImageIndex);

  return (
    <section className="plant-detail-page">
      <button className="back-button detail-back" onClick={() => navigate("/plants")}>Back to all plants</button>
      <div className="plant-detail">
        <div className="plant-detail-media">
          <div className="plant-detail-image">
            <img src={mainImage} alt={product.name} />
            {product.featured && <span className="floating-tag">Featured</span>}
          </div>
          {galleryImages.length > 0 && (
            <div className="plant-detail-gallery">
              {galleryImages.map(({ image, index }) => (
                <button
                  type="button"
                  key={image}
                  onMouseEnter={() => setActiveImageIndex(index)}
                  onFocus={() => setActiveImageIndex(index)}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Show ${product.name} photo ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="plant-detail-copy">
          <p className="eyebrow"><Leaf size={16} /> {product.category}</p>
          <h1>{product.name}</h1>
          <div className="detail-price-row">
            <div className="detail-price">{product.priceText || "Contact for price"}</div>
            <span className={product.inStock ? "stock in" : "stock out"}>
              {product.inStock ? "In stock" : "Out of stock"}
            </span>
          </div>
          <div className="detail-facts">
            <span><SunMedium size={18} /> {product.light}</span>
            <span><Droplets size={18} /> {careLevelLabels[product.careLevel] || product.careLevel}</span>
            <span><BadgeCheck size={18} /> Direct inquiry</span>
          </div>
          <div className="custom-order-panel">
            <strong>Customize your order</strong>
            <p>Need a different pot, size, quantity, or arrangement? Contact us and we will help prepare it for your space.</p>
          </div>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+94717552000"><Phone size={18} /> Call now</a>
            <a className="secondary-action" href="https://wa.me/94717552000">WhatsApp inquiry</a>
          </div>
          <div className="detail-description">
            <h3>Plant details</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-copy">
        <p className="eyebrow"><Mail size={16} /> Get in touch</p>
        <h2>Let’s choose the right plant for your space.</h2>
        <p>
          Contact Modern Nature Plant for availability, plant recommendations,
          gifting ideas, or help choosing greenery for your home or workplace.
        </p>
      </div>
      <div className="contact-actions">
        <a href="tel:+94717552000">
          <Phone size={20} />
          <span><strong>Call</strong>+94 71 755 2000</span>
        </a>
        <a href="mailto:modernnatureplant@gmail.com">
          <Mail size={20} />
          <span><strong>Email</strong>modernnatureplant@gmail.com</span>
        </a>
        <a href="https://wa.me/94717552000">
          <MapPin size={20} />
          <span><strong>WhatsApp</strong>+94 71 755 2000</span>
        </a>
      </div>
    </section>
  );
}

function Footer({ navigate }) {
  const [openFooterSection, setOpenFooterSection] = useState("");
  const toggleFooterSection = (section) => {
    setOpenFooterSection((current) => (current === section ? "" : section));
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <span className="footer-logo"><img src={logo} alt="" /></span>
            <span>Modern Nature Plant</span>
          </div>
          <p>Premium plant display catalog for homes, offices, cafes, and thoughtful green gifts.</p>
          <div className="footer-socials" aria-label="Social media links">
            <a
              href="https://www.facebook.com/share/1HT9sHof5j/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              aria-label="Modern Nature Plant on Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/modern.natureplant_86?utm_source=qr&igsh=MWY2ejBvYmFnOGdtcA=="
              target="_blank"
              rel="noreferrer"
              aria-label="Modern Nature Plant on Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
        <div className={`footer-links footer-accordion ${openFooterSection === "explore" ? "open" : ""}`}>
          <button className="footer-accordion-trigger" onClick={() => toggleFooterSection("explore")}>
            Explore <ChevronDown size={18} />
          </button>
          <div className="footer-accordion-body">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/plants")}>Plants</button>
            <button onClick={() => navigate("/", "about")}>About</button>
            <button onClick={() => navigate("/", "contact")}>Contact</button>
            <button onClick={() => navigate("/admin")}>Admin</button>
          </div>
        </div>
        <div className={`footer-contact footer-accordion ${openFooterSection === "contact" ? "open" : ""}`}>
          <button className="footer-accordion-trigger" onClick={() => toggleFooterSection("contact")}>
            Contact <ChevronDown size={18} />
          </button>
          <div className="footer-accordion-body">
            <a href="tel:+94717552000">+94 71 755 2000</a>
            <a href="mailto:modernnatureplant@gmail.com">modernnatureplant@gmail.com</a>
            <a href="https://wa.me/94717552000">WhatsApp inquiry</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 Modern Nature Plant. All rights reserved.</span>
      </div>
    </footer>
  );
}

function AdminDashboard({ token, setToken, products, categories, reload, navigate }) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const login = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const data = await api.login(loginForm);
      localStorage.setItem("mnp_token", data.token);
      setToken(data.token);
      setMessage("Welcome back, admin.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("mnp_token");
    setToken("");
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const productImages = [form.imageUrl, ...form.images].filter(Boolean).filter((image, index, list) => list.indexOf(image) === index).slice(0, 4);
      const payload = {
        ...form,
        imageUrl: productImages[0] || "",
        images: productImages
      };

      if (editingId) {
        await api.updateProduct(editingId, payload, token);
        setMessage("Product updated.");
      } else {
        await api.createProduct(payload, token);
        setMessage("Product added.");
      }
      setForm(emptyForm);
      setEditingId("");
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const uploadImage = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 4);
    if (!files.length) return;

    setUploading(true);
    setMessage("");
    try {
      const uploadedImages = [];
      for (const file of files) {
        const data = await api.uploadImage(file, token);
        uploadedImages.push(data.imageUrl);
      }

      setForm((current) => {
        const images = [current.imageUrl, ...current.images, ...uploadedImages]
          .filter(Boolean)
          .filter((image, index, list) => list.indexOf(image) === index)
          .slice(0, 4);
        return { ...current, imageUrl: images[0] || "", images };
      });
      setMessage(`${uploadedImages.length} image${uploadedImages.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const addCategory = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.createCategory(newCategory, token);
      setNewCategory("");
      setMessage("Category added.");
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteCategory = async (id) => {
    const confirmed = window.confirm("Delete this category?");
    if (!confirmed) return;
    try {
      await api.deleteCategory(id, token);
      setMessage("Category deleted.");
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const startEditCategory = (item) => {
    setEditingCategoryId(item._id);
    setEditingCategoryName(item.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId("");
    setEditingCategoryName("");
  };

  const saveCategoryEdit = async () => {
    setMessage("");
    try {
      await api.updateCategory(editingCategoryId, editingCategoryName, token);
      setMessage("Category updated.");
      cancelEditCategory();
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category || "",
      priceText: product.priceText || "",
      description: product.description || "",
      careLevel: product.careLevel || "Easy",
      light: product.light || "",
      imageUrl: getProductImages(product)[0] || "",
      images: getProductImages(product),
      featured: Boolean(product.featured),
      inStock: Boolean(product.inStock)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    try {
      await api.deleteProduct(id, token);
      await reload();
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateImageUrls = (value) => {
    const images = value
      .split(/\r?\n/)
      .map((image) => image.trim())
      .filter(Boolean)
      .slice(0, 4);
    setForm((current) => ({ ...current, imageUrl: images[0] || "", images }));
  };

  const removeProductImage = (imageToRemove) => {
    setForm((current) => {
      const images = current.images.filter((image) => image !== imageToRemove);
      return { ...current, imageUrl: images[0] || "", images };
    });
  };

  if (!token) {
    return (
      <main className="admin-page">
        <button className="back-button" onClick={() => navigate("/")}>Back to website</button>
        <section className="login-panel">
          <div className="login-brand-panel">
            <img className="admin-login-logo" src={logo} alt="Modern Nature Plant logo" />
            <p className="eyebrow"><Lock size={16} /> Admin access</p>
            <h1>Catalog control room.</h1>
            <p>Manage plant photos, categories, featured products, stock status, and display details from one private dashboard.</p>
            <div className="login-mini-list">
              <span>Product updates</span>
              <span>Category control</span>
              <span>Image uploads</span>
            </div>
          </div>
          <form className="login-form-card" onSubmit={login}>
            <div>
              <span className="login-form-kicker">Secure sign in</span>
              <h2>Welcome back</h2>
              <p>Enter your admin credentials to continue.</p>
            </div>
            <input
              type="email"
              placeholder="Admin email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              required
            />
            <button type="submit">Login</button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <button className="back-button" onClick={() => navigate("/")}>Back to website</button>
        <button className="logout-button" onClick={logout}><LogOut size={17} /> Logout</button>
      </div>

      <section className="admin-layout">
        <form className="product-form" onSubmit={saveProduct}>
          <p className="eyebrow"><PenLine size={16} /> Product manager</p>
          <h1>{editingId ? "Edit plant" : "Add a plant"}</h1>
          <input placeholder="Plant name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item._id} value={item.name}>{item.name}</option>
            ))}
          </select>
          <input placeholder="Price text" value={form.priceText} onChange={(event) => setForm({ ...form, priceText: event.target.value })} />
          <input placeholder="Light needs" value={form.light} onChange={(event) => setForm({ ...form, light: event.target.value })} />
          <label className="field-label">Availability</label>
          <select value={form.inStock ? "in-stock" : "out-of-stock"} onChange={(event) => setForm({ ...form, inStock: event.target.value === "in-stock" })}>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
          <label className="upload-box">
            <span>{uploading ? "Uploading images..." : "Upload up to 4 plant images"}</span>
            <input type="file" accept="image/*" multiple onChange={uploadImage} disabled={uploading} />
          </label>
          {form.images.length > 0 && (
            <div className="image-preview-grid">
              {form.images.map((image, index) => (
                <div className="image-preview" key={image}>
                  <img src={image} alt={`Selected plant preview ${index + 1}`} />
                  <span>{index === 0 ? "Main image" : `Photo ${index + 1}`}</span>
                  <button type="button" onClick={() => removeProductImage(image)} aria-label={`Remove photo ${index + 1}`}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            placeholder="Image URLs - one per line, maximum 4"
            value={form.images.join("\n")}
            onChange={(event) => updateImageUrls(event.target.value)}
            required
          />
          <label className="field-label">Care level</label>
          <select value={form.careLevel} onChange={(event) => setForm({ ...form, careLevel: event.target.value })}>
            <option value="Easy">Easy - Low maintenance</option>
            <option value="Moderate">Moderate - Needs regular care</option>
            <option value="Expert">Expert - Requires special care</option>
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          <label className="check-row">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
            Featured product
          </label>
          <button type="submit">{editingId ? "Save changes" : "Add product"}</button>
          {editingId && <button type="button" className="ghost-button" onClick={() => { setEditingId(""); setForm(emptyForm); }}>Cancel edit</button>}
          {message && <p className="form-message">{message}</p>}
        </form>

        <div className="admin-products">
          <form className="category-manager" onSubmit={addCategory}>
            <div>
              <h2>Categories</h2>
              <span>{categories.length} saved</span>
            </div>
            <label className="category-input-row">
              <input
                placeholder="New category name"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              />
              <button type="submit">Add</button>
            </label>
            <div className="category-list">
              {categories.map((item) => (
                <span key={item._id}>
                  {editingCategoryId === item._id ? (
                    <div className="inline-category-edit">
                      <input
                        value={editingCategoryName}
                        onChange={(event) => setEditingCategoryName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            saveCategoryEdit();
                          }
                        }}
                        autoFocus
                      />
                      <button type="button" onClick={saveCategoryEdit}>Save</button>
                      <button type="button" onClick={cancelEditCategory}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      {item.name}
                      <button type="button" className="edit-category-button" onClick={() => startEditCategory(item)}>Edit</button>
                      <button type="button" onClick={() => deleteCategory(item._id)} aria-label={`Delete ${item.name}`}>x</button>
                    </>
                  )}
                </span>
              ))}
            </div>
          </form>

          <div className="admin-heading">
            <h2>Current catalog</h2>
            <span>{products.length} plants</span>
          </div>
          {products.map((product) => (
            <article key={product._id} className="admin-product">
              <img src={getProductImages(product)[0] || product.imageUrl} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category} · {getProductImages(product).length} photo{getProductImages(product).length === 1 ? "" : "s"}</span>
              </div>
              <button onClick={() => editProduct(product)} aria-label={`Edit ${product.name}`}><PenLine size={17} /></button>
              <button onClick={() => deleteProduct(product._id)} aria-label={`Delete ${product.name}`}><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
