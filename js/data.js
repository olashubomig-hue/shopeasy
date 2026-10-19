/**
 * ShopEasy Product Catalog Data
 * 14 Curated Products across Electronics, Fashion, and Home
 * Each product has: id, name, price, oldPrice (optional), category, image, description, rating, stock, isNew
 */
const products = [
  {
    id: 1,
    name: "Aura Noise-Canceling Headphones",
    price: 45000,
    oldPrice: 58000,
    category: "Electronics",
    image: "images/headphones.jpg",
    description: "Architectural sound crafted for mindful listening. Features hybrid active noise cancellation, custom 40mm beryllium drivers, 38-hour battery endurance, and breathable memory foam cups wrapped in vegetable-tanned leather.",
    rating: 4.9,
    stock: 14,
    isNew: true
  },
  {
    id: 2,
    name: "Apex Pulse Minimalist Smartwatch",
    price: 36000,
    oldPrice: 44000,
    category: "Electronics",
    image: "images/watch.jpg",
    description: "An ultra-slim brushed titanium smartwatch with an always-on ambient AMOLED display, optical biometric sensors for heart and sleep metrics, GPS navigation, and 5ATM water resistance.",
    rating: 4.8,
    stock: 8,
    isNew: false
  },
  {
    id: 3,
    name: "SonicBlast Waterproof Speaker",
    price: 24500,
    oldPrice: 32000,
    category: "Electronics",
    image: "images/speaker.jpg",
    description: "Tactile acoustic power built into an IPX7 waterproof casing. Dual passive radiators deliver deep, resonant bass, with 20 hours of continuous playback and seamless stereo pairing.",
    rating: 4.7,
    stock: 4, // Low stock demo!
    isNew: false
  },
  {
    id: 4,
    name: "HyperGlide Precision Wireless Mouse",
    price: 19500,
    category: "Electronics",
    image: "images/mouse.jpg",
    description: "Sculpted ergonomic silhouette engineered for marathon creative workflows. Ultra-low latency optical sensor with 26,000 DPI, silent tactile switches, and dual Bluetooth/2.4GHz connectivity.",
    rating: 4.6,
    stock: 19,
    isNew: true
  },
  {
    id: 5,
    name: "UltraClear 4K Studio Webcam",
    price: 28000,
    oldPrice: 35000,
    category: "Electronics",
    image: "images/webcam.jpg",
    description: "Cinematic desktop clarity with dual stereo microphones and built-in hardware privacy slider. Dynamic HDR exposure balancing ensures studio illumination in any room.",
    rating: 4.8,
    stock: 6,
    isNew: false
  },
  {
    id: 6,
    name: "CloudStep Breathable Knit Sneakers",
    price: 26000,
    oldPrice: 34000,
    category: "Fashion",
    image: "images/sneakers.jpg",
    description: "Featherweight engineered knit upper paired with an energy-returning sugarcane EVA sole. Designed for effortless urban exploration and tailored casual aesthetics.",
    rating: 4.9,
    stock: 12,
    isNew: true
  },
  {
    id: 7,
    name: "Heritage Canvas & Leather Backpack",
    price: 32000,
    category: "Fashion",
    image: "images/backpack.jpg",
    description: "Handcrafted 18oz waterproof cotton duck canvas reinforced with full-grain bridle leather trims, dedicated 16-inch padded laptop pocket, and solid brass hardware.",
    rating: 4.9,
    stock: 7,
    isNew: false
  },
  {
    id: 8,
    name: "Solstice Polarized Acetate Sunglasses",
    price: 16500,
    oldPrice: 22000,
    category: "Fashion",
    image: "images/sunglasses.jpg",
    description: "Timeless geometric frames handcrafted from custom plant-based Italian acetate. Features category 3 polarized lenses with 100% UVA/UVB barrier protection.",
    rating: 4.7,
    stock: 15,
    isNew: false
  },
  {
    id: 9,
    name: "Chronos Classic Chronograph Watch",
    price: 48000,
    oldPrice: 62000,
    category: "Fashion",
    image: "images/chronograph.jpg",
    description: "Understated horological precision featuring an anti-reflective sapphire crystal dome, Japanese meca-quartz movement, and an interchangeable saddle-stitched Italian leather strap.",
    rating: 5.0,
    stock: 5, // Low stock demo!
    isNew: true
  },
  {
    id: 10,
    name: "Voyager Weekend Duffel Bag",
    price: 38000,
    category: "Fashion",
    image: "images/duffel.jpg",
    description: "The quintessential travel companion. Generous 45L capacity constructed with ballistic nylon, ventilated separate shoe compartment, and padded shoulder strap.",
    rating: 4.8,
    stock: 11,
    isNew: false
  },
  {
    id: 11,
    name: "Lumina Minimalist Arc Desk Lamp",
    price: 22000,
    oldPrice: 29000,
    category: "Home",
    image: "images/lamp.jpg",
    description: "A sweeping brushed brass arc with soft edge-lit LED diffuser. Touch-sensitive continuous dimming and warm 2700K to cool 5000K circadian spectrum control.",
    rating: 4.8,
    stock: 9,
    isNew: true
  },
  {
    id: 12,
    name: "Artisan Ceramic Mug Set (Set of 4)",
    price: 14000,
    category: "Home",
    image: "images/mugs.jpg",
    description: "Wheel-thrown stoneware mugs glazed in a warm speckled cream and sage wash. Comfortable oversized handle and thick heat-retaining ceramic walls.",
    rating: 4.9,
    stock: 16,
    isNew: false
  },
  {
    id: 13,
    name: "Botanical Soy Wax Aromatherapy Candle",
    price: 9500,
    oldPrice: 13000,
    category: "Home",
    image: "images/candle.jpg",
    description: "Hand-poured 100% natural soy wax infused with wild sage, crisp eucalyptus, and warm cedarwood essential oils. Clean 55-hour burn time with a crackling wooden wick.",
    rating: 4.6,
    stock: 3, // Low stock demo!
    isNew: false
  },
  {
    id: 14,
    name: "Textured Linen Throw Pillow Covers",
    price: 12500,
    category: "Home",
    image: "images/pillow.jpg",
    description: "Woven from 100% European flax with an earthy raw texture and concealed brass zip closure. Pre-washed for lived-in softness and natural relaxed drape.",
    rating: 4.7,
    stock: 20,
    isNew: true
  }
];