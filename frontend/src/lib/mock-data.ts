import { api, ApiError } from "@/lib/api-client";
import productTransformer from "@/assets/product-transformer-1.jpg";
import productSwitchgear from "@/assets/product-switchgear.jpg";
import productGenerator from "@/assets/product-generator.jpg";
import productBusbar from "@/assets/product-busbar.jpg";
import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";
import team3 from "@/assets/team-3.jpg";
import team4 from "@/assets/team-4.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

export const company = {
  name: "PT Batam Konektra Jaya",
  shortName: "Konektra",
  tagline: "Engineering Solutions for Industrial Power",
  description:
    "PT Batam Konektra Jaya is an Indonesian engineering company supplying transformers, switchgear, and industrial electrical systems to the power, energy, and heavy manufacturing sectors.",
  founded: 2004,
  address: "Kawasan Industri Batamindo, Lot 312, Batam 29433, Kepulauan Riau, Indonesia",
  phone: "+62 778 611 2200",
  email: "sales@batamkonektra.co.id",
  whatsapp: "+62 811 7000 220",
  whatsappNumber: "6281170002200",
  hours: "Mon – Fri  08:00 – 17:00 WIB",
  hoursDetail: [
    { day: "Monday – Friday", hours: "08:00 – 17:00 WIB" },
    { day: "Saturday", hours: "09:00 – 13:00 WIB" },
    { day: "Sunday & Public Holidays", hours: "Closed" },
  ],
  mapEmbed: "https://www.google.com/maps?q=Kawasan+Industri+Batamindo+Batam+Indonesia&output=embed",
};

export type Stat = { value: string; suffix?: string; label: string };
export const stats: Stat[] = [
  { value: "20", suffix: "+", label: "Years of Engineering Experience" },
  { value: "500", suffix: "+", label: "Completed Industrial Projects" },
  { value: "150", suffix: "+", label: "Certified Product Lines" },
  { value: "98", suffix: "%", label: "Customer Satisfaction Rate" },
];

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  availability: "Available" | "Limited Stock" | "Out of Stock";
  shortDescription: string;
  image: string;
  gallery?: string[];
  description?: string[];
  features?: string[];
  specs?: { label: string; value: string }[];
  applications?: string[];
  standards?: string[];
  brochure?: string;
  datasheet?: string;
  sku?: string;
  model?: string;
  advantages?: string[];
  industries?: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
};

export const productCategories = [
  "Transformers",
  "Switchgear",
  "Generators",
  "Power Distribution",
] as const;

export const productBrands = [
  "Konektra",
  "Siemens",
  "ABB",
  "Schneider Electric",
  "Perkins",
  "Cummins",
] as const;

export const productAvailabilities = ["Available", "Limited Stock", "Out of Stock"] as const;

const commonGallery = [gallery1, gallery2, gallery3, gallery4];

const defaultDescription = [
  "Engineered and manufactured to international quality standards, this product is designed for demanding industrial and utility environments where reliability, safety, and long service life are non-negotiable.",
  "Each unit is fully tested at our Batam facility and delivered with complete factory test reports, ensuring compliance with the applicable IEC, SPLN, and SNI standards.",
];

const defaultFeatures = [
  "Type-tested design compliant with international standards",
  "Robust construction for tropical and industrial environments",
  "Low maintenance with long operational service life",
  "Factory acceptance testing on every unit",
  "Full technical documentation and test reports included",
];

const defaultApplications = [
  "Utility distribution networks",
  "Industrial plants and manufacturing facilities",
  "Commercial buildings and data centers",
  "Oil, gas, and offshore installations",
];

const defaultStandards = ["IEC 60076", "SPLN D3.002", "SNI IEC 61439"];

export const products: Product[] = [
  {
    id: "p-001",
    slug: "distribution-transformer-1000-kva",
    name: "Oil-Immersed Distribution Transformer 1000 kVA",
    category: "Transformers",
    brand: "Konektra",
    availability: "Limited Stock",
    shortDescription:
      "Three-phase 20 kV / 0.4 kV ONAN transformer for utility and industrial substations.",
    image: productTransformer,
  },
  {
    id: "p-002",
    slug: "lv-switchgear-panel-mns",
    name: "Low-Voltage Switchgear Panel, MNS Type",
    category: "Switchgear",
    brand: "ABB",
    availability: "Available",
    shortDescription:
      "Form 4b withdrawable LV panel up to 6300 A, fully type-tested to IEC 61439-2.",
    image: productSwitchgear,
  },
  {
    id: "p-003",
    slug: "diesel-genset-500-kva",
    name: "Industrial Diesel Generator Set 500 kVA",
    category: "Generators",
    brand: "Perkins",
    availability: "Available",
    shortDescription:
      "Prime-rated genset with Perkins engine, Stamford alternator, and AMF control panel.",
    image: productGenerator,
  },
  {
    id: "p-004",
    slug: "copper-busbar-trunking-2500a",
    name: "Copper Busbar Trunking System 2500 A",
    category: "Power Distribution",
    brand: "Schneider Electric",
    availability: "Limited Stock",
    shortDescription:
      "Sandwich-type busway for vertical risers and horizontal feeders in commercial buildings.",
    image: productBusbar,
  },
  {
    id: "p-005",
    slug: "dry-type-transformer-1600-kva",
    name: "Cast-Resin Dry-Type Transformer 1600 kVA",
    category: "Transformers",
    brand: "Siemens",
    availability: "Out of Stock",
    shortDescription:
      "Indoor cast-resin transformer with F1 fire class, suitable for data centers and high-rises.",
    image: productTransformer,
  },
  {
    id: "p-006",
    slug: "mv-rmu-12kv",
    name: "Medium-Voltage Ring Main Unit 12 kV",
    category: "Switchgear",
    brand: "Schneider Electric",
    availability: "Available",
    shortDescription: "Compact SF6-insulated RMU for secondary distribution networks up to 24 kV.",
    image: productSwitchgear,
  },
  {
    id: "p-007",
    slug: "amf-ats-panel",
    name: "AMF / ATS Control Panel",
    category: "Power Distribution",
    brand: "Konektra",
    availability: "Limited Stock",
    shortDescription:
      "Automatic mains failure and transfer switch panel with PLC-based controller and HMI.",
    image: productBusbar,
  },
  {
    id: "p-008",
    slug: "diesel-genset-1000-kva",
    name: "Industrial Diesel Generator Set 1000 kVA",
    category: "Generators",
    brand: "Cummins",
    availability: "Limited Stock",
    shortDescription: "Sound-attenuated container genset for offshore platforms and remote sites.",
    image: productGenerator,
  },
  {
    id: "p-009",
    slug: "power-transformer-5000-kva",
    name: "Power Transformer 5000 kVA / 33 kV",
    category: "Transformers",
    brand: "Siemens",
    availability: "Out of Stock",
    shortDescription:
      "Two-winding oil-immersed power transformer for step-down substations up to 36 kV.",
    image: productTransformer,
  },
  {
    id: "p-010",
    slug: "vacuum-circuit-breaker-24kv",
    name: "Vacuum Circuit Breaker 24 kV",
    category: "Switchgear",
    brand: "ABB",
    availability: "Available",
    shortDescription:
      "Withdrawable indoor VCB with electronic trip relay and integrated protection.",
    image: productSwitchgear,
  },
  {
    id: "p-011",
    slug: "capacitor-bank-panel-400kvar",
    name: "Automatic Capacitor Bank Panel 400 kVAr",
    category: "Power Distribution",
    brand: "Konektra",
    availability: "Limited Stock",
    shortDescription:
      "Detuned capacitor bank with intelligent PFR controller for reactive power compensation.",
    image: productBusbar,
  },
  {
    id: "p-012",
    slug: "diesel-genset-250-kva",
    name: "Compact Diesel Generator Set 250 kVA",
    category: "Generators",
    brand: "Perkins",
    availability: "Available",
    shortDescription:
      "Compact standby genset for commercial buildings and telecom sites, silent canopy.",
    image: productGenerator,
  },
];

export type TeamMember = {
  id: string;
  name: string;
  position: string;
  bio: string;
  photo: string;
};

export const team: TeamMember[] = [
  {
    id: "t-001",
    name: "Ir. Suryadi Wijaya, M.Eng.",
    position: "President Director",
    bio: "Over 28 years leading transformer manufacturing and substation engineering across Southeast Asia.",
    photo: team1,
  },
  {
    id: "t-002",
    name: "Linda Hartono, M.B.A.",
    position: "Director of Operations",
    bio: "Drives manufacturing excellence, quality systems, and supply chain reliability across all sites.",
    photo: team2,
  },
  {
    id: "t-003",
    name: "Ir. Bambang Setiawan",
    position: "Director of Engineering",
    bio: "Leads the engineering team behind custom power equipment and turnkey substation projects.",
    photo: team3,
  },
  {
    id: "t-004",
    name: "Dewi Kartika, S.T.",
    position: "Head of Sales & Customer Solutions",
    bio: "Partners with utilities and EPC contractors to deliver tailored industrial power solutions.",
    photo: team4,
  },
];

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  excerpt: string;
  content?: string[];
  image: string;
  featured?: boolean;
  tags?: string[];
  gallery?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
};

export const newsCategories = [
  "All",
  "Project",
  "Company",
  "Technology",
  "Industry",
  "Events",
] as const;

export const news: NewsArticle[] = [
  {
    id: "n-001",
    slug: "data-center-substation-commissioned",
    title: "Konektra Commissions 20 MVA Substation for Tier-III Data Center in Batam",
    category: "Project",
    date: "2026-05-18",
    author: "Editorial Team",
    readTime: "5 min read",
    excerpt:
      "Our engineering team completed energization of a redundant 20/0.4 kV substation supporting a new hyperscale data center in Batam.",
    image: news1,
    featured: true,
    tags: ["Data Center", "Substation", "Batam"],
  },
  {
    id: "n-002",
    slug: "partnership-european-switchgear-oem",
    title: "Strategic Partnership Signed with European Switchgear Manufacturer",
    category: "Company",
    date: "2026-04-02",
    author: "Corporate Affairs",
    readTime: "3 min read",
    excerpt:
      "A new technology partnership expands our portfolio with IEC-certified medium-voltage switchgear assembled locally in Batam.",
    image: news2,
    tags: ["Partnership", "Switchgear"],
  },
  {
    id: "n-003",
    slug: "offshore-platform-electrification",
    title: "Offshore Platform Electrification Project Delivered Ahead of Schedule",
    category: "Project",
    date: "2026-02-21",
    author: "Project Office",
    readTime: "6 min read",
    excerpt:
      "Konektra supplied containerized gensets and SF6 switchgear for an offshore platform in the Natuna Sea, completing handover six weeks early.",
    image: news3,
    tags: ["Offshore", "Genset"],
  },
  {
    id: "n-004",
    slug: "iso-45001-certification-awarded",
    title: "Konektra Awarded ISO 45001:2018 Certification for Occupational Health & Safety",
    category: "Company",
    date: "2026-01-15",
    author: "HSE Department",
    readTime: "4 min read",
    excerpt:
      "Following a rigorous audit, our Batam manufacturing facility is now certified to ISO 45001:2018, reinforcing our commitment to worker safety.",
    image: news2,
    tags: ["ISO", "Safety"],
  },
  {
    id: "n-005",
    slug: "smart-grid-monitoring-launch",
    title: "New Smart Grid Monitoring Platform for Substation Automation Launched",
    category: "Technology",
    date: "2025-11-08",
    author: "Engineering Team",
    readTime: "7 min read",
    excerpt:
      "Konektra introduces an IEC 61850-compliant SCADA gateway for real-time monitoring, event logging, and predictive maintenance of substations.",
    image: news1,
    tags: ["Smart Grid", "SCADA", "IoT"],
  },
  {
    id: "n-006",
    slug: "electricity-outlook-indonesia-2026",
    title: "Indonesia Electricity Outlook 2026: Renewables, Grid Resilience, and Industrial Demand",
    category: "Industry",
    date: "2025-10-12",
    author: "Market Insights",
    readTime: "8 min read",
    excerpt:
      "A market perspective on grid investment, renewable integration, and the industrial electrification wave shaping Indonesia's energy sector.",
    image: news3,
    tags: ["Renewables", "Grid", "Outlook"],
  },
  {
    id: "n-007",
    slug: "electra-expo-2025-recap",
    title: "Electra Expo 2025: Konektra Showcases Cast-Resin Transformer Range",
    category: "Events",
    date: "2025-09-04",
    author: "Marketing Team",
    readTime: "3 min read",
    excerpt:
      "Highlights from our booth at Electra Expo Jakarta, featuring the new cast-resin transformer line and live SCADA demonstrations.",
    image: news2,
    tags: ["Expo", "Jakarta"],
  },
  {
    id: "n-008",
    slug: "training-program-electrical-engineers",
    title: "Konektra Academy Trains 120 Junior Electrical Engineers in 2025",
    category: "Company",
    date: "2025-08-20",
    author: "Human Capital",
    readTime: "4 min read",
    excerpt:
      "Our internal academy has graduated a record 120 junior engineers from partner universities across Sumatera, Java, and Kalimantan.",
    image: news1,
    tags: ["Talent", "Academy"],
  },
];

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  album: string;
  span?: "sm" | "md" | "lg";
  isVideo?: boolean;
  duration?: string;
};

export const galleryAlbums = ["All", "Substations", "Manufacturing", "Projects", "Videos"] as const;

export const galleryImages: GalleryItem[] = [
  {
    id: "g-1",
    src: gallery1,
    alt: "High-voltage substation at dusk",
    album: "Substations",
    span: "lg",
  },
  {
    id: "g-2",
    src: gallery2,
    alt: "Engineers inspecting a power transformer",
    album: "Manufacturing",
    span: "md",
  },
  {
    id: "g-3",
    src: gallery3,
    alt: "Welding work at the manufacturing facility",
    album: "Manufacturing",
    span: "sm",
  },
  {
    id: "g-4",
    src: gallery4,
    alt: "Aerial view of a power generation complex",
    album: "Projects",
    span: "lg",
  },
  {
    id: "g-5",
    src: news1,
    alt: "Data center electrical room",
    album: "Projects",
    span: "md",
  },
  {
    id: "g-6",
    src: news3,
    alt: "Offshore platform electrification",
    album: "Projects",
    span: "md",
  },
  {
    id: "g-7",
    src: news2,
    alt: "Project handover signing ceremony",
    album: "Projects",
    span: "sm",
  },
  {
    id: "g-8",
    src: gallery1,
    alt: "Transmission infrastructure at sunset",
    album: "Substations",
    span: "md",
  },
  {
    id: "g-9",
    src: gallery2,
    alt: "Assembly of medium-voltage panel",
    album: "Manufacturing",
    span: "sm",
  },
  {
    id: "g-10",
    src: gallery4,
    alt: "Substation commissioning site view",
    album: "Substations",
    span: "sm",
  },
  {
    id: "v-1",
    src: news1,
    alt: "Substation commissioning walkthrough",
    album: "Videos",
    span: "md",
    isVideo: true,
    duration: "3:24",
  },
  {
    id: "v-2",
    src: gallery3,
    alt: "Inside the transformer factory",
    album: "Videos",
    span: "md",
    isVideo: true,
    duration: "5:12",
  },
  {
    id: "v-3",
    src: news3,
    alt: "Offshore genset installation",
    album: "Videos",
    span: "sm",
    isVideo: true,
    duration: "2:47",
  },
];

export type FaqItem = { question: string; answer: string };
export const faqs: FaqItem[] = [
  {
    question: "What is your typical lead time for custom transformers?",
    answer:
      "Standard oil-immersed distribution transformers ship in 8–12 weeks. Custom cast-resin or power transformers typically require 14–20 weeks depending on rating and voltage class.",
  },
  {
    question: "Do you provide site commissioning and after-sales service?",
    answer:
      "Yes. We operate service centers in Batam, Jakarta, and Surabaya. Our teams handle installation supervision, commissioning, factory acceptance tests (FAT), and long-term preventive maintenance contracts.",
  },
  {
    question: "Which international standards do your products comply with?",
    answer:
      "Our products are type-tested to IEC 60076 (transformers), IEC 61439 (switchgear), and IEC 60947 series. We also comply with SPLN and SNI standards mandated by PLN and Indonesian regulators.",
  },
  {
    question: "Can Konektra deliver turnkey substation projects?",
    answer:
      "Absolutely. We deliver end-to-end EPC packages: engineering design, equipment supply, civil works coordination, installation, testing, commissioning, and O&M handover.",
  },
  {
    question: "How do I request a quotation?",
    answer:
      "Send us your technical specifications through the contact form, WhatsApp, or email. Our sales engineers respond with a formal proposal within 2–3 business days.",
  },
  {
    question: "Do you export outside Indonesia?",
    answer:
      "Yes. We regularly export to Malaysia, Singapore, Vietnam, and the Middle East, with full compliance documentation and logistics coordination handled in-house.",
  },
];

export const whyChooseUs = [
  {
    title: "Professional Engineering Team",
    description:
      "Certified electrical engineers with decades of experience in industrial power systems.",
    icon: "Users",
  },
  {
    title: "Type-Tested Quality",
    description: "Every product is manufactured and tested to IEC, SPLN, and SNI standards.",
    icon: "ShieldCheck",
  },
  {
    title: "After-Sales Support",
    description:
      "Dedicated service centers in Batam, Jakarta, and Surabaya for commissioning and maintenance.",
    icon: "Wrench",
  },
  {
    title: "Reliable Delivery",
    description:
      "On-time project execution backed by a controlled supply chain and in-house logistics.",
    icon: "Truck",
  },
];

// ---- Placeholder API functions, replace internals with real fetches later ----
export async function fetchProducts(): Promise<Product[]> {
  return products;
}
export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

const specsByCategory: Record<string, { label: string; value: string }[]> = {
  Transformers: [
    { label: "Rated Power", value: "1000 – 2500 kVA" },
    { label: "Primary Voltage", value: "20 kV" },
    { label: "Secondary Voltage", value: "0.4 kV" },
    { label: "Frequency", value: "50 Hz" },
    { label: "Vector Group", value: "Dyn5 / Dyn11" },
    { label: "Cooling", value: "ONAN / AN" },
    { label: "Insulation Class", value: "F (155 °C)" },
    { label: "Standard", value: "IEC 60076 / SPLN D3.002" },
  ],
  Switchgear: [
    { label: "Rated Voltage", value: "690 V AC / 12 kV" },
    { label: "Rated Current", value: "Up to 6300 A" },
    { label: "Short-Circuit Withstand", value: "100 kA / 1 s" },
    { label: "Form of Separation", value: "Form 4b" },
    { label: "Degree of Protection", value: "IP54" },
    { label: "Busbar Material", value: "Electrolytic Copper" },
    { label: "Standard", value: "IEC 61439-1/2" },
  ],
  Generators: [
    { label: "Prime Power", value: "500 – 1000 kVA" },
    { label: "Voltage", value: "400 / 230 V, 3-phase" },
    { label: "Frequency", value: "50 Hz" },
    { label: "Engine", value: "Perkins / Cummins" },
    { label: "Alternator", value: "Stamford" },
    { label: "Control Panel", value: "DeepSea AMF / ATS" },
    { label: "Enclosure", value: "Sound-attenuated, IP23" },
    { label: "Fuel Tank", value: "8-hour base tank" },
  ],
  "Power Distribution": [
    { label: "Rated Current", value: "Up to 2500 A" },
    { label: "Rated Voltage", value: "690 V AC" },
    { label: "Conductor", value: "Electrolytic Copper" },
    { label: "Insulation", value: "Class B (130 °C)" },
    { label: "Degree of Protection", value: "IP55" },
    { label: "Standard", value: "IEC 61439-6" },
  ],
};

export type ProductDetail = Required<
  Pick<Product, "gallery" | "description" | "features" | "specs" | "applications" | "standards">
> &
  Product;

export function getProductDetail(product: Product): ProductDetail {
  return {
    ...product,
    gallery: product.gallery ?? [product.image, ...commonGallery.slice(0, 3)],
    description: product.description ?? defaultDescription,
    features: product.features ?? defaultFeatures,
    specs: product.specs ?? specsByCategory[product.category] ?? [],
    applications: product.applications ?? defaultApplications,
    standards: product.standards ?? defaultStandards,
  };
}

export function relatedProducts(current: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.id !== current.id && p.category === current.category)
    .concat(products.filter((p) => p.id !== current.id && p.category !== current.category))
    .slice(0, limit);
}

export async function fetchLatestNews(): Promise<NewsArticle[]> {
  return news;
}
export async function submitInquiry(payload: {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: "Product Detail" | "Request Quotation";
  productSlug?: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await api.post("/inquiries", payload);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.firstError() ?? e.message };
    return {
      ok: false,
      message: "Could not reach the server. Please try again.",
    };
  }
}
export async function submitContact(payload: unknown): Promise<{ ok: boolean; message?: string }> {
  try {
    await api.post("/contact", payload);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.firstError() ?? e.message };
    return {
      ok: false,
      message: "Could not reach the server. Please try again.",
    };
  }
}
