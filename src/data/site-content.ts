// Everything in this file is STATIC CONTENT — text that isn't fetched from
// the API (menu items, categories, orders, customers always come from the
// backend). This is the one place to edit copy like the About page story,
// testimonials, chef bios, or the default contact details shown in the footer.
// If it's real data that changes via the admin panel, it does NOT belong here.

export const SITE_CONTENT = {
  // Short tagline shown in the site footer.
  footerTagline:
    "Crafting unforgettable culinary moments in the heart of the city. Join us for a taste of the extraordinary.",

  // Default contact details displayed in the footer/contact page.
  contact: {
    address: "221B Bistro Lane, Lucknow, Uttar Pradesh",
    phone: "+91 98765 43210",
    email: "hello@bites.example",
  },

  // Homepage hero banner copy and image.
  hero: {
    title: "We Serve The",
    highlight: "Taste You Love",
    subtitle:
      "Experience the perfect blend of local fresh ingredients and culinary expertise. From farm-to-table masterpieces to comforting neighborhood classics.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop",
  },

  // Feature/value-prop cards shown on the homepage (icon name + copy).
  features: [
    {
      icon: "Truck",
      title: "Fast Delivery",
      description: "Hot, fresh food delivered quickly to your door.",
    },
    {
      icon: "Sparkles",
      title: "Fresh Ingredients",
      description: "Sourced daily from trusted local farms.",
    },
    {
      icon: "Clock",
      title: "Always On Time",
      description: "We track every order so nothing runs late.",
    },
    {
      icon: "ShieldCheck",
      title: "Clean Kitchen",
      description: "Highest hygiene standards, every single day.",
    },
  ],

  // Customer testimonial quotes shown on the homepage.
  testimonials: [
    {
      name: "Sarah Jenkins",
      role: "Regular Customer",
      quote:
        "The best atmosphere and incredible flavors. I've never tasted a carbonara quite like this. A must-visit neighborhood gem!",
      rating: 5,
    },
    {
      name: "Aarav Mehta",
      role: "Frequent Diner",
      quote: "Delivery is always fast and the packaging keeps everything perfectly warm. My go-to for weeknight dinners.",
      rating: 5,
    },
    {
      name: "Priya Nair",
      role: "Food Blogger",
      quote: "Every dish feels handmade with care. The truffle fries are unreasonably good.",
      rating: 5,
    },
  ],

  // Chef profile cards (name, role, photo) shown on the homepage/about page.
  chefs: [
    {
      name: "Marco Rossi",
      role: "Head Chef",
      imageUrl: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=500&fit=crop",
    },
    {
      name: "Elena Vance",
      role: "Pastry Expert",
      imageUrl: "https://images.unsplash.com/photo-1595257841889-8b2c5c93a4a8?w=400&h=500&fit=crop",
    },
  ],

  // About-page story copy and stat counters.
  about: {
    title: "Our Story",
    body: [
      "Bites started as a single neighborhood counter with one promise: food that feels like it was made for you, not for a menu photo. Years later, that promise hasn't changed.",
      "Every dish is built from fresh, locally sourced ingredients, prepared daily by a small team that genuinely loves what they cook. We believe great food doesn't need to be complicated — it needs to be honest.",
      "Whether you're ordering a quick weekday lunch or treating yourself to something special, we want every order to feel like a small act of comfort.",
    ],
    stats: [
      { label: "Years of Service", value: "15+" },
      { label: "Dishes Served", value: "50K+" },
      { label: "Happy Customers", value: "10K+" },
    ],
  },
} as const;
