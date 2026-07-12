require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  console.log("🔌 Testing Supabase connection to:", url);
  
  try {
    const { data, error } = await supabase.from("settings").select("*").limit(1);
    
    if (error) {
      console.error("❌ Connection failed with Supabase error:");
      console.error(error);
      process.exit(1);
    } else {
      console.log("✅ Successfully connected to Supabase!");
      console.log(`✅ Queried 'settings' table, found ${data.length} records.`);
      process.exit(0);
    }
  } catch (err) {
    console.error("❌ Connection threw an exception:");
    console.error(err);
    process.exit(1);
  }
}

testConnection();
