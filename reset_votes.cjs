require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetVotes() {
  console.log("Resetting all nominee votes to 0...");
  
  // To update all rows, we can just use a condition that is always true
  // like not equal to some non-existent ID
  const { data, error } = await supabase
    .from('nominees')
    .update({ votes: 0 })
    .neq('id', 'non-existent-placeholder');
    
  if (error) {
    console.error("Error resetting votes:", error);
  } else {
    console.log("Successfully reset all ballot votes to 0!");
  }
}

resetVotes();
