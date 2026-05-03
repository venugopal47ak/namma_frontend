export const locations = [
  {
    city: "Vellore",
    area: "Katpadi",
    lat: 12.9692,
    lng: 79.1452
  },
  {
    city: "Vellore",
    area: "Sathuvachari",
    lat: 12.9497,
    lng: 79.1376
  },
  {
    city: "Tiruvannamalai",
    area: "Gandhi Nagar",
    lat: 12.2253,
    lng: 79.0747
  },
  {
    city: "Tiruvannamalai",
    area: "Chengam Road",
    lat: 12.2318,
    lng: 79.0589
  },
  {
    city: "Chennai",
    area: "Velachery",
    lat: 12.9815,
    lng: 80.2206
  },
  {
    city: "Chennai",
    area: "Anna Nagar",
    lat: 13.085,
    lng: 80.2101
  },
  {
    city: "Ranipet",
    area: "Arcot",
    lat: 12.9052,
    lng: 79.318
  },
  {
    city: "Tirupattur",
    area: "Tirupattur Town",
    lat: 12.4957,
    lng: 78.5671
  },
  {
    city: "Kanchipuram",
    area: "Enathur",
    lat: 12.8342,
    lng: 79.7036
  },
  {
    city: "Tiruvallur",
    area: "Tiruvallur Town",
    lat: 13.1439,
    lng: 79.9087
  },
  {
    city: "Chengalpattu",
    area: "GST Road",
    lat: 12.6922,
    lng: 79.977
  },
  {
    city: "Villupuram",
    area: "Villupuram Town",
    lat: 11.939,
    lng: 79.4861
  }
];

export const heroSlides = [
  {
    id: 1,
    eyebrow: "Hyperlocal repairs, without the platform tax",
    title: "Book trusted local service help, not from a distant queue.",
    description:
      "Faster slots, direct coordination, and flexible prices from verified local teams.",
    image:
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1400&q=80",
    accent: "from-coral/80 via-ember/60 to-transparent"
  },
  {
    id: 2,
    eyebrow: "Built for modern home services",
    title: "Fast, transparent booking with cash or online support.",
    description:
      "From electricians to mechanics, everything is designed for easy access and quick communication.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=80",
    accent: "from-teal/80 via-mint/50 to-transparent"
  },
  {
    id: 3,
    eyebrow: "Affordable by design",
    title: "See transparent pricing, clear service details, and the best match for your budget.",
    description:
      "No hidden commissions in the dark. Find real starter fees and service details upfront.",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80",
    accent: "from-ink/80 via-coral/40 to-transparent"
  }
];

export const fallbackServices = [
  {
    _id: "svc-1",
    title: "Electrician Visit",
    category: "Electrician",
    slug: "electrician-visit",
    description: "Switchboards, fans, wiring, inverter support, and urgent power faults.",
    image: "/images/services/electrician.png",
    basePrice: 249,
    tags: ["15 min response", "Local verified"],
    featured: true
  },
  {
    _id: "svc-2",
    title: "Plumber Repair",
    category: "Plumber",
    slug: "plumber-repair",
    description: "Leaks, pipes, taps, motors, bathroom fittings, and tank work.",
    image: "/images/services/plumber.png",
    basePrice: 299,
    tags: ["No hidden charges", "Same-day service"],
    featured: true
  },
  {
    _id: "svc-3",
    title: "Bike & Car Mechanic",
    category: "Mechanic",
    slug: "bike-car-mechanic",
    description: "Puncture help, jump start, oil change, and doorstep diagnostics.",
    image: "/images/services/mechanic.png",
    basePrice: 399,
    tags: ["Doorstep fix", "Direct updates"],
    featured: true
  },
  {
    _id: "svc-4",
    title: "AC Service",
    category: "AC Repair",
    slug: "ac-service",
    description: "Cooling issues, wash, gas top-up guidance, and maintenance visits.",
    image: "/images/services/ac-repair.png",
    basePrice: 599,
    tags: ["Season-ready", "Transparent quote"],
    featured: true
  },
  {
    _id: "svc-5",
    title: "Appliance Repair",
    category: "Appliance Repair",
    slug: "appliance-repair",
    description: "Washing machine, fridge, mixer, microwave, and more.",
    image: "/images/services/appliance.png",
    basePrice: 349,
    tags: ["Multi-brand support"],
    featured: false
  },
  {
    _id: "svc-6",
    title: "Deep Home Cleaning",
    category: "Cleaning",
    slug: "deep-home-cleaning",
    description: "Kitchen, bathroom, sofa, and move-in deep cleaning packages.",
    image: "/images/services/cleaning.png",
    basePrice: 799,
    tags: ["Bundle offers"],
    featured: false
  }
];

export const fallbackProviders = [
  {
    _id: "prov-1",
    user: { name: "Gokul Smart Electricians", phone: "919840100111" },
    city: "Vellore",
    area: "Katpadi",
    serviceCategories: ["Electrician"],
    pricingCatalog: [{ basePrice: 249 }],
    coverImage: "/images/services/electrician.png",
    ratingAvg: 4.9,
    reviewCount: 142,
    distanceKm: 1.4,
    availableNow: true,
    jobsCompleted: 510,
    responseTimeMinutes: 18,
    experienceYears: 9,
    headline: "Fast-response electrician for homes, shops, and hostels in Katpadi",
    whatsappLink:
      "https://wa.me/919840100111?text=Hi%20Gokul%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-2",
    user: { name: "Arunachala Plumbing Co.", phone: "919840100133" },
    city: "Tiruvannamalai",
    area: "Gandhi Nagar",
    serviceCategories: ["Plumber"],
    pricingCatalog: [{ basePrice: 299 }],
    coverImage: "/images/services/plumber.png",
    ratingAvg: 4.9,
    reviewCount: 133,
    distanceKm: 2.1,
    availableNow: true,
    jobsCompleted: 470,
    responseTimeMinutes: 20,
    experienceYears: 10,
    headline: "Leak repair, motor fitting, and bathroom work across Tiruvannamalai town",
    whatsappLink:
      "https://wa.me/919840100133?text=Hi%20Arunachala%20Plumbing%20Co.%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-3",
    user: { name: "Metro Appliance Clinic", phone: "919840100155" },
    city: "Chennai",
    area: "Velachery",
    serviceCategories: ["Appliance Repair"],
    pricingCatalog: [{ basePrice: 349 }],
    coverImage: "/images/services/appliance.png",
    ratingAvg: 4.8,
    reviewCount: 176,
    distanceKm: 4.3,
    availableNow: true,
    jobsCompleted: 560,
    responseTimeMinutes: 19,
    experienceYears: 8,
    headline: "Fridge, washing machine, and microwave repair across south Chennai",
    whatsappLink:
      "https://wa.me/919840100155?text=Hi%20Metro%20Appliance%20Clinic%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-4",
    user: { name: "Arcot Motor Assist", phone: "919840100177" },
    city: "Ranipet",
    area: "Arcot",
    serviceCategories: ["Mechanic"],
    pricingCatalog: [{ basePrice: 399 }],
    coverImage: "/images/services/mechanic.png",
    ratingAvg: 4.7,
    reviewCount: 91,
    distanceKm: 6.2,
    availableNow: false,
    jobsCompleted: 315,
    responseTimeMinutes: 28,
    experienceYears: 6,
    headline: "Doorstep bike and car mechanic for Arcot and Ranipet belt",
    whatsappLink:
      "https://wa.me/919840100177?text=Hi%20Arcot%20Motor%20Assist%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-5",
    user: { name: "Kanchi Comfort Services", phone: "919840100199" },
    city: "Kanchipuram",
    area: "Enathur",
    serviceCategories: ["AC Repair"],
    pricingCatalog: [{ basePrice: 599 }],
    coverImage: "/images/services/ac-repair.png",
    ratingAvg: 4.8,
    reviewCount: 96,
    distanceKm: 7.1,
    availableNow: true,
    jobsCompleted: 308,
    responseTimeMinutes: 27,
    experienceYears: 7,
    headline: "AC cleaning and cooling checks for homes, hostels, and shops",
    whatsappLink:
      "https://wa.me/919840100199?text=Hi%20Kanchi%20Comfort%20Services%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-6",
    user: { name: "Villupuram Deep Clean Crew", phone: "919840100233" },
    city: "Villupuram",
    area: "Villupuram Town",
    serviceCategories: ["Cleaning"],
    pricingCatalog: [{ basePrice: 799 }],
    coverImage: "/images/services/cleaning.png",
    ratingAvg: 4.8,
    reviewCount: 94,
    distanceKm: 9.4,
    availableNow: true,
    jobsCompleted: 287,
    responseTimeMinutes: 34,
    experienceYears: 6,
    headline: "Home and office deep cleaning for weekly, move-in, and festive needs",
    whatsappLink:
      "https://wa.me/919840100233?text=Hi%20Villupuram%20Deep%20Clean%20Crew%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-7",
    user: { name: "Tirupattur Power & Pump Works", phone: "919840100188" },
    city: "Tirupattur",
    area: "Tirupattur Town",
    serviceCategories: ["Electrician", "Plumber"],
    pricingCatalog: [{ basePrice: 249 }, { basePrice: 299 }],
    coverImage: "/images/services/plumber.png",
    ratingAvg: 4.8,
    reviewCount: 104,
    distanceKm: 5.8,
    availableNow: true,
    jobsCompleted: 360,
    responseTimeMinutes: 26,
    experienceYears: 9,
    headline: "Electrician and plumber combo team for homes and stores",
    whatsappLink:
      "https://wa.me/919840100188?text=Hi%20Tirupattur%20Power%20%26%20Pump%20Works%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-8",
    user: { name: "GST Road Auto Rescue", phone: "919840100222" },
    city: "Chengalpattu",
    area: "GST Road",
    serviceCategories: ["Mechanic"],
    pricingCatalog: [{ basePrice: 399 }],
    coverImage: "/images/services/mechanic.png",
    ratingAvg: 4.7,
    reviewCount: 84,
    distanceKm: 8.2,
    availableNow: false,
    jobsCompleted: 242,
    responseTimeMinutes: 30,
    experienceYears: 5,
    headline: "Roadside mechanic for Chengalpattu, Maraimalai Nagar, and NH stretches",
    whatsappLink:
      "https://wa.me/919840100222?text=Hi%20GST%20Road%20Auto%20Rescue%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-9",
    user: { name: "Tiruvallur Water Works", phone: "919840100211" },
    city: "Tiruvallur",
    area: "Tiruvallur Town",
    serviceCategories: ["Plumber"],
    pricingCatalog: [{ basePrice: 299 }],
    coverImage: "/images/services/plumber.png",
    ratingAvg: 4.8,
    reviewCount: 112,
    distanceKm: 6.6,
    availableNow: true,
    jobsCompleted: 378,
    responseTimeMinutes: 25,
    experienceYears: 8,
    headline: "Plumbing support for homes, bore motors, and tank lines in Tiruvallur",
    whatsappLink:
      "https://wa.me/919840100211?text=Hi%20Tiruvallur%20Water%20Works%2C%20I%20found%20you%20on%20NammaServe."
  },
  {
    _id: "prov-10",
    user: { name: "Northline Electricals", phone: "919840100166" },
    city: "Chennai",
    area: "Anna Nagar",
    serviceCategories: ["Electrician"],
    pricingCatalog: [{ basePrice: 249 }],
    coverImage: "/images/services/electrician.png",
    ratingAvg: 4.9,
    reviewCount: 214,
    distanceKm: 3.1,
    availableNow: true,
    jobsCompleted: 710,
    responseTimeMinutes: 16,
    experienceYears: 12,
    headline: "Licensed electrician for apartments, villas, and small offices in Anna Nagar",
    whatsappLink:
      "https://wa.me/919840100166?text=Hi%20Northline%20Electricals%2C%20I%20found%20you%20on%20NammaServe."
  }
];

export const trustStats = [
  { label: "Average rating", value: "4.8+" },
  { label: "Households served", value: "18K+" },
  { label: "Verified local pros", value: "1.2K+" }
];

export const offerBanners = [
  {
    title: "First booking offer",
    subtitle: "Use code NAMMA150 for Rs.150 off above Rs.799",
    color: "from-coral via-amber-300 to-yellow-100"
  },
  {
    title: "Fast response lane",
    subtitle: "Share your request instantly and skip back-and-forth calls",
    color: "from-teal via-emerald-300 to-cyan-100"
  },
  {
    title: "Local combo packs",
    subtitle: "Electrician + plumber visit bundles for apartment move-ins",
    color: "from-ink via-slate-500 to-slate-200"
  }
];

export const translations = {
  EN: {
    nav: {
      services: "Services",
      bookings: "My bookings",
      provider: "Provider desk",
      admin: "Admin",
      login: "Login / Register"
    },
    home: {
      searchPlaceholder: "What service do you need? Electrician, AC repair, plumber...",
      trustTitle: "Trusted local services, tuned for speed and affordability",
      categoriesTitle: "Explore services",
      featuredTitle: "Most booked services",
      nearbyTitle: "Service details",
      nearbySubtitle: "See clear pricing, match criteria, and quick service options."
    }
  },
  }
;
