require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_NOMINEES = [
  // 1. New Artist of the Year
  { id: "nom-1-1", category_id: 1, name: "Sia Amara", description: "Rising vocalist blending traditional Sierra Leonean folk with modern soul.", votes: 0, list_type: "final" },
  { id: "nom-1-2", category_id: 1, name: "K-Man Junior", description: "Young afrobeat sensation with back-to-back viral hits.", votes: 0, list_type: "final" },
  { id: "nom-1-3", category_id: 1, name: "Fatima Jalloh", description: "Visual artist focusing on West African diaspora identities.", votes: 0, list_type: "final" },

  // 2. Thriving Local Business
  { id: "nom-2-1", category_id: 2, name: "Salone Spice Bistro", description: "Local restaurant chain employing youth and celebrating cultural cuisine.", votes: 0, list_type: "final" },
  { id: "nom-2-2", category_id: 2, name: "Kono Gem Logistics", description: "Pioneering eco-friendly shipping and delivery service.", votes: 0, list_type: "final" },
  { id: "nom-2-3", category_id: 2, name: "Sierra Loom Fabrics", description: "Boutique standardizing traditional country-cloth production.", votes: 0, list_type: "final" },

  // 3. DJ of the Year
  { id: "nom-3-1", category_id: 3, name: "DJ Base", description: "Legendary radio host and champion of local indie artists.", votes: 0, list_type: "final" },
  { id: "nom-3-2", category_id: 3, name: "DJ Flame", description: "Club and festival favorite known for spectacular transitions.", votes: 0, list_type: "final" },
  { id: "nom-3-3", category_id: 3, name: "DJ Sparkz", description: "Pioneering female DJ leading community sound system projects.", votes: 0, list_type: "final" },

  // 4. Social Media / Content Creator of the Year
  { id: "nom-4-1", category_id: 4, name: "Vamboi Comedy", description: "Creating wholesome, cultural skits that bring families together.", votes: 0, list_type: "final" },
  { id: "nom-4-2", category_id: 4, name: "Salone Tech Review", description: "Educating thousands on digital skills and hardware in Krio.", votes: 0, list_type: "final" },
  { id: "nom-4-3", category_id: 4, name: "The Wandering Sierra", description: "High-production travel vlogging showcasing national tourism.", votes: 0, list_type: "final" },

  // 5. Alumni of the Year
  { id: "nom-5-1", category_id: 5, name: "Dr. Lansana Conteh", description: "Class of 2017. Built a non-profit clinic network in regional towns.", votes: 0, list_type: "final" },
  { id: "nom-5-2", category_id: 5, name: "Mariama Turay, Esq.", description: "Class of 2019. Leading human rights attorney advocating for girls.", votes: 0, list_type: "final" },
  { id: "nom-5-3", category_id: 5, name: "Abu Bakarr Kamara", description: "Class of 2015. Tech lead championing STEM education pipelines.", votes: 0, list_type: "final" },

  // 6. Moseray Fadika Humanitarian Award
  { id: "nom-6-1", category_id: 6, name: "The Mercy Foundation", description: "Providing clean drinking water and sanitary installations to over 50 schools.", votes: 0, list_type: "final" },
  { id: "nom-6-2", category_id: 6, name: "Mother Fatima's Orphanage", description: "Providing loving homes, education, and nutrition to vulnerable children for 20 years.", votes: 0, list_type: "final" },
  { id: "nom-6-3", category_id: 6, name: "Hope for All Clinics", description: "Mobile healthcare caravans servicing remote rural locations at zero cost.", votes: 0, list_type: "final" },

  // 7. Musician/Artist of the Year
  { id: "nom-7-1", category_id: 7, name: "Star Zee", description: "A trailblazing force in African dancehall and hip-hop, inspiring millions.", votes: 0, list_type: "final" },
  { id: "nom-7-2", category_id: 7, name: "Drizilik", description: "Grammy-recognized artist bringing Sierra Leonean 'Freetown sound' globally.", votes: 0, list_type: "final" },
  { id: "nom-7-3", category_id: 7, name: "Emmerson", description: "Enduring voice of musical social commentary and cultural expression.", votes: 0, list_type: "final" },

  // 8. Legendary Award
  { id: "nom-8-1", category_id: 8, name: "Jimmy B", description: "The Godfather of modern Sierra Leonean audio-visual and musical production.", votes: 0, list_type: "final" },
  { id: "nom-8-2", category_id: 8, name: "Prof. Eldred Jones", description: "Pioneering scholar who elevated African literature onto the global stage.", votes: 0, list_type: "final" },
  { id: "nom-8-3", category_id: 8, name: "Dr. Olayinka Koso-Thomas", description: "Pioneering medical practitioner and worldwide campaigner for women's health.", votes: 0, list_type: "final" },

  // 9. Descendants Union of the Year
  { id: "nom-9-1", category_id: 9, name: "Kono Descendants Union (KDU)", description: "Funded standard high school renovations and digital laboratories.", votes: 0, list_type: "final" },
  { id: "nom-9-2", category_id: 9, name: "Freetown Heritage Alliance", description: "Sponsoring historical preservation and disaster-relief coordination.", votes: 0, list_type: "final" },
  { id: "nom-9-3", category_id: 9, name: "Makeni Progressive Union", description: "Providing micro-loans to local women traders and cooperative farmers.", votes: 0, list_type: "final" },

  // 10. International Act of the Year Award
  { id: "nom-10-1", category_id: 10, name: "Burna Boy", description: "Grammy-winning Afrobeats star continuing to represent the continent globally.", votes: 0, list_type: "final" },
  { id: "nom-10-2", category_id: 10, name: "Idris Elba", description: "Global actor and advocate spearheading regional creative and smart-city investments.", votes: 0, list_type: "final" },
  { id: "nom-10-3", category_id: 10, name: "Wizkid", description: "Pioneering global music giant with immense cultural influence.", votes: 0, list_type: "final" },

  // 11. Professional Award of the Year
  { id: "nom-11-1", category_id: 11, name: "Dr. Sahr Gbakima", description: "Leading epidemiologist steering public health safety and research.", votes: 0, list_type: "final" },
  { id: "nom-11-2", category_id: 11, name: "Isatu Sesay", description: "Renewable energy engineer bringing solar micro-grids to rural communities.", votes: 0, list_type: "final" },
  { id: "nom-11-3", category_id: 11, name: "Josephine Kamara", description: "Distinguished financial executive facilitating digital banking inclusion.", votes: 0, list_type: "final" },
];

async function seedNominees() {
  console.log("Seeding INITIAL_NOMINEES to Supabase database...");
  
  for (const nom of INITIAL_NOMINEES) {
    const { error } = await supabase.from('nominees').upsert(nom, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting ${nom.name}:`, error);
    } else {
      console.log(`Successfully seeded: ${nom.name}`);
    }
  }

  console.log("Seeding complete! You can now manage them directly from the database.");
}

seedNominees();
