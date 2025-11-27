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
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251127190350_create_tasks_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('🚀 Applying database migration...');
    
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // If the RPC function doesn't exist, try direct SQL execution
      console.log('⚠️  RPC method not available, trying direct SQL execution...');
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          if (stmtError) {
            console.error(`❌ Error executing statement: ${stmtError.message}`);
            throw stmtError;
          }
        }
      }
    }
    
    console.log('✅ Migration applied successfully!');
    
    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'tasks');
    
    if (tableError) {
      console.log('⚠️  Could not verify table creation via information_schema, trying direct query...');
      
      // Try a simple query to verify the table exists
      const { data: testData, error: testError } = await supabase
        .from('tasks')
        .select('count(*)')
        .limit(1);
      
      if (testError) {
        console.error('❌ Table verification failed:', testError.message);
        throw testError;
      } else {
        console.log('✅ Tasks table verified successfully!');
      }
    } else {
      console.log('✅ Tasks table verified successfully!');
    }
    
    // Check sample data
    console.log('📊 Checking sample data...');
    const { data: sampleTasks, error: sampleError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError.message);
    } else {
      console.log(`✅ Found ${sampleTasks.length} sample tasks in database`);
      if (sampleTasks.length > 0) {
        console.log('📋 Sample tasks:');
        sampleTasks.forEach(task => {
          console.log(`  - ${task.title} (${task.category || 'No category'})`);
        });
      }
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('🔗 Your TaskMaster application is now ready to use.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('📋 Full error:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();