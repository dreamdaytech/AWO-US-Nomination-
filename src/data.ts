/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Nominee } from "./types";

export const CONTACT_INFO = {
  email: "awolamerica@hotmail.com",
  website: "www.awolamerica.org",
  websiteUrl: "https://www.awolamerica.org",
  telephone: "301-379-7049",
  formsAppUrl: "https://qh4dxvvs.forms.app/awol-america-awards-nomination",
  chairman: "Mohamed Majid Kamara",
  title: "Chairman, AWOL AMERICA",
};

export const TIMELINE_DATES = {
  announcement: "July 3, 2026",
  nominationStart: "2026-07-10T00:00:00",
  nominationEnd: "2026-07-30T23:59:59",
  votingStart: "2026-07-31T00:00:00",
  votingEnd: "2026-08-25T23:59:59",
  ceremony: "2026-09-05T18:00:00",
};

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "New Artist of the Year",
    description: "Honoring emerging musical or visual artists who have made a stunning breakthrough impact this year.",
    iconName: "Sparkles",
  },
  {
    id: 2,
    name: "Thriving Local Business",
    description: "Recognizing local enterprises that demonstrate exceptional resilience, community support, and commercial success.",
    iconName: "Briefcase",
  },
  {
    id: 3,
    name: "DJ of the Year",
    description: "Celebrating DJs who excel in performance, musical curation, crowd engagement, and community presence.",
    iconName: "Music",
  },
  {
    id: 4,
    name: "Social Media / Content Creator of the Year",
    description: "Honoring individuals producing highly engaging, positive, and impactful digital media content.",
    iconName: "Video",
  },
  {
    id: 5,
    name: "Alumni of the Year",
    description: "Recognizing outstanding graduates or former members who continue to embody AWOL's core values in their career.",
    iconName: "GraduationCap",
  },
  {
    id: 6,
    name: "Moseray Fadika Humanitarian Award",
    description: "Our signature award celebrating extraordinary selflessness, charitable impact, and lifelong dedication to humanitarian service.",
    iconName: "HeartHandshake",
  },
  {
    id: 7,
    name: "Musician/Artist of the Year",
    description: "Recognizing established musicians or artists whose creative work has achieved widespread national or global acclaim.",
    iconName: "Mic2",
  },
  {
    id: 8,
    name: "Legendary Award",
    description: "A lifetime achievement honor celebrating individuals who have made historic, enduring contributions to their field.",
    iconName: "Trophy",
  },
  {
    id: 9,
    name: "Descendants Union of the Year",
    description: "Celebrating ancestral or regional descendant organizations that foster unity, cultural preservation, and social support.",
    iconName: "Users2",
  },
  {
    id: 10,
    name: "International Act of the Year Award",
    description: "Honoring global icons and international figures whose artistry or positive deeds transcend national boundaries.",
    iconName: "Globe2",
  },
  {
    id: 11,
    name: "Professional Award of the Year",
    description: "Awarded to exceptional working professionals (healthcare, education, law, tech) demonstrating outstanding leadership.",
    iconName: "Award",
  },
];

export const INITIAL_NOMINEES: Nominee[] = [
  // 1. New Artist of the Year
  { id: "nom-1-1", categoryId: 1, name: "Sia Amara", description: "Rising vocalist blending traditional Sierra Leonean folk with modern soul.", votes: 142 },
  { id: "nom-1-2", categoryId: 1, name: "K-Man Junior", description: "Young afrobeat sensation with back-to-back viral hits.", votes: 118 },
  { id: "nom-1-3", categoryId: 1, name: "Fatima Jalloh", description: "Visual artist focusing on West African diaspora identities.", votes: 95 },

  // 2. Thriving Local Business
  { id: "nom-2-1", categoryId: 2, name: "Salone Spice Bistro", description: "Local restaurant chain employing youth and celebrating cultural cuisine.", votes: 204 },
  { id: "nom-2-2", categoryId: 2, name: "Kono Gem Logistics", description: "Pioneering eco-friendly shipping and delivery service.", votes: 188 },
  { id: "nom-2-3", categoryId: 2, name: "Sierra Loom Fabrics", description: "Boutique standardizing traditional country-cloth production.", votes: 167 },

  // 3. DJ of the Year
  { id: "nom-3-1", categoryId: 3, name: "DJ Base", description: "Legendary radio host and champion of local indie artists.", votes: 312 },
  { id: "nom-3-2", categoryId: 3, name: "DJ Flame", description: "Club and festival favorite known for spectacular transitions.", votes: 284 },
  { id: "nom-3-3", categoryId: 3, name: "DJ Sparkz", description: "Pioneering female DJ leading community sound system projects.", votes: 299 },

  // 4. Social Media / Content Creator of the Year
  { id: "nom-4-1", categoryId: 4, name: "Vamboi Comedy", description: "Creating wholesome, cultural skits that bring families together.", votes: 412 },
  { id: "nom-4-2", categoryId: 4, name: "Salone Tech Review", description: "Educating thousands on digital skills and hardware in Krio.", votes: 315 },
  { id: "nom-4-3", categoryId: 4, name: "The Wandering Sierra", description: "High-production travel vlogging showcasing national tourism.", votes: 380 },

  // 5. Alumni of the Year
  { id: "nom-5-1", categoryId: 5, name: "Dr. Lansana Conteh", description: "Class of 2017. Built a non-profit clinic network in regional towns.", votes: 154 },
  { id: "nom-5-2", categoryId: 5, name: "Mariama Turay, Esq.", description: "Class of 2019. Leading human rights attorney advocating for girls.", votes: 189 },
  { id: "nom-5-3", categoryId: 5, name: "Abu Bakarr Kamara", description: "Class of 2015. Tech lead championing STEM education pipelines.", votes: 144 },

  // 6. Moseray Fadika Humanitarian Award
  { id: "nom-6-1", categoryId: 6, name: "The Mercy Foundation", description: "Providing clean drinking water and sanitary installations to over 50 schools.", votes: 532 },
  { id: "nom-6-2", categoryId: 6, name: "Mother Fatima's Orphanage", description: "Providing loving homes, education, and nutrition to vulnerable children for 20 years.", votes: 611 },
  { id: "nom-6-3", categoryId: 6, name: "Hope for All Clinics", description: "Mobile healthcare caravans servicing remote rural locations at zero cost.", votes: 498 },

  // 7. Musician/Artist of the Year
  { id: "nom-7-1", categoryId: 7, name: "Star Zee", description: "A trailblazing force in African dancehall and hip-hop, inspiring millions.", votes: 442 },
  { id: "nom-7-2", categoryId: 7, name: "Drizilik", description: "Grammy-recognized artist bringing Sierra Leonean 'Freetown sound' globally.", votes: 589 },
  { id: "nom-7-3", categoryId: 7, name: "Emmerson", description: "Enduring voice of musical social commentary and cultural expression.", votes: 521 },

  // 8. Legendary Award
  { id: "nom-8-1", categoryId: 8, name: "Jimmy B", description: "The Godfather of modern Sierra Leonean audio-visual and musical production.", votes: 610 },
  { id: "nom-8-2", categoryId: 8, name: "Prof. Eldred Jones", description: "Pioneering scholar who elevated African literature onto the global stage.", votes: 412 },
  { id: "nom-8-3", categoryId: 8, name: "Dr. Olayinka Koso-Thomas", description: "Pioneering medical practitioner and worldwide campaigner for women's health.", votes: 523 },

  // 9. Descendants Union of the Year
  { id: "nom-9-1", categoryId: 9, name: "Kono Descendants Union (KDU)", description: "Funded standard high school renovations and digital laboratories.", votes: 243 },
  { id: "nom-9-2", categoryId: 9, name: "Freetown Heritage Alliance", description: "Sponsoring historical preservation and disaster-relief coordination.", votes: 198 },
  { id: "nom-9-3", categoryId: 9, name: "Makeni Progressive Union", description: "Providing micro-loans to local women traders and cooperative farmers.", votes: 220 },

  // 10. International Act of the Year Award
  { id: "nom-10-1", categoryId: 10, name: "Burna Boy", description: "Grammy-winning Afrobeats star continuing to represent the continent globally.", votes: 654 },
  { id: "nom-10-2", categoryId: 10, name: "Idris Elba", description: "Global actor and advocate spearheading regional creative and smart-city investments.", votes: 789 },
  { id: "nom-10-3", categoryId: 10, name: "Wizkid", description: "Pioneering global music giant with immense cultural influence.", votes: 532 },

  // 11. Professional Award of the Year
  { id: "nom-11-1", categoryId: 11, name: "Dr. Sahr Gbakima", description: "Leading epidemiologist steering public health safety and research.", votes: 194 },
  { id: "nom-11-2", categoryId: 11, name: "Isatu Sesay", description: "Renewable energy engineer bringing solar micro-grids to rural communities.", votes: 231 },
  { id: "nom-11-3", categoryId: 11, name: "Josephine Kamara", description: "Distinguished financial executive facilitating digital banking inclusion.", votes: 180 },
];
