// Upload gallery photos to Supabase
// Run with: node scripts/upload-gallery.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PHOTOS_DIR = path.join(__dirname, '../photos-2025/compressed');
const BUCKET_NAME = 'gallery';

// Generate caption from filename  
function generateCaption(filename) {
  const captions = [
    'Live performance at The Blind Pig',
    'Crowd enjoying the music',
    'Supporting Ann Arbor Meals on Wheels',
    'Grunge rock filling the venue',
    'Community coming together for charity',
    'Local bands rocking the stage',
    'An unforgettable night of music',
    'Fans showing their support',
    'The energy was electric',
    'Making a difference through music'
  ];
  // Use filename hash to pick consistent caption
  const hash = filename.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return captions[hash % captions.length];
}

async function main() {
  console.log('📸 Adding gallery records to database...\n');

  // Get all photos from storage
  const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`Found ${files.length} photos\n`);

  let uploaded = 0;
  let errors = 0;

  for (const filename of files) {
    const storagePath = `2025/${filename}`;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    process.stdout.write(`Adding: ${filename}... `);

    // Insert into photo_gallery table - matches schema.sql
    const { error: dbError } = await supabase
      .from('photo_gallery')
      .insert({
        image_url: urlData.publicUrl,
        caption: generateCaption(filename),
        photographer: 'Event Photography'
        // event_id is optional, leaving null for now
      });

    if (dbError) {
      console.log('❌ Error:', dbError.message);
      errors++;
    } else {
      console.log('✅');
      uploaded++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ Successfully added: ${uploaded} photos`);
  if (errors > 0) {
    console.log(`❌ Errors: ${errors}`);
  }
  console.log(`\nGallery is now populated!`);
}

main().catch(console.error);
