import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file manually
const envContent = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // First, check if the table already exists
    console.log('🔍 Checking if tasks table already exists...');
    const { data: existingTasks, error: checkError } = await supabase
      .from('tasks')
      .select('count(*)')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Tasks table already exists!');
      console.log('📊 Checking existing data...');
      
      const { data: allTasks, error: dataError } = await supabase
        .from('tasks')
        .select('*');
      
      if (!dataError) {
        console.log(`✅ Found ${allTasks.length} existing tasks in database`);
        if (allTasks.length > 0) {
          console.log('📋 Existing tasks:');
          allTasks.forEach(task => {
            console.log(`  - ${task.title} (${task.category || 'No category'}) - ${task.is_completed ? 'Completed' : 'Pending'}`);
          });
        }
        console.log('\n🎉 Database is already set up and ready to use!');
        return;
      }
    }
    
    console.log('📄 Table does not exist, creating from migration...');
    
    // Since we can't execute raw SQL directly, we'll need to use the Supabase dashboard
    // or install the Supabase CLI. Let's try a different approach.
    console.log('⚠️  Direct SQL execution not available with anonymous key.');
    console.log('📋 To complete the migration, you have two options:');
    console.log('');
    console.log('Option 1: Use Supabase Dashboard');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Navigate to your project: pmncilppqnzacbplsdti');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the migration SQL from: supabase/migrations/20251127190350_create_tasks_table.sql');
    console.log('5. Execute the SQL');
    console.log('');
    console.log('Option 2: Install Supabase CLI');
    console.log('1. Install: npm install -g supabase');
    console.log('2. Login: supabase login');
    console.log('3. Link project: supabase link --project-ref pmncilppqnzacbplsdti');
    console.log('4. Apply migration: supabase db push');
    console.log('');
    console.log('📄 Migration SQL content:');
    console.log('----------------------------------------');
    
    // Read and display the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251127190350_create_tasks_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('----------------------------------------');
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    console.error('📋 Full error:', error);
  }
}

// Run the migration check
applyMigration();