require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdmin() {
  const { data, error } = await supabase
    .from('admins')
    .insert([
      {
        name: 'Super Admin',
        email: 'awardsalone@gmail.com',
        password: 'password123'
      }
    ]);

  if (error) {
    console.error('Error adding admin:', error.message);
  } else {
    console.log('Successfully added Super Admin: awardsalone@gmail.com');
  }
}

addAdmin();
