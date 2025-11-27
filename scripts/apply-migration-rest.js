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
  process.exit(1);
}

async function applyMigrationViaRest() {
  try {
    console.log('🔗 Connecting to Supabase REST API...');
    console.log(`📍 URL: ${supabaseUrl}`);
    
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251127190350_create_tasks_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`);
    
    // Try to execute each statement via REST API
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;
      
      console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 60)}...`);
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({ sql: statement })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`⚠️  Statement ${i + 1} failed: ${response.status} ${response.statusText}`);
          console.log(`   Error: ${errorText}`);
          
          // If it's a CREATE TABLE statement, try a different approach
          if (statement.includes('CREATE TABLE')) {
            console.log('   Trying alternative approach for table creation...');
            // We'll handle this differently below
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.log(`❌ Error executing statement ${i + 1}: ${error.message}`);
      }
    }
    
    console.log('\n🔍 Checking if migration was successful...');
    
    // Test if we can query the tasks table
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/tasks?select=count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ Tasks table is accessible!');
      
      // Get all tasks to verify data
      const tasksResponse = await fetch(`${supabaseUrl}/rest/v1/tasks?select=*`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        }
      });
      
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        console.log(`📊 Found ${tasks.length} tasks in database`);
        if (tasks.length > 0) {
          console.log('📋 Sample tasks:');
          tasks.forEach(task => {
            console.log(`  - ${task.title} (${task.category || 'No category'}) - ${task.is_completed ? 'Completed' : 'Pending'}`);
          });
        }
      }
    } else {
      console.log('❌ Tasks table is not accessible yet');
      const errorText = await testResponse.text();
      console.log(`   Error: ${testResponse.status} ${testResponse.statusText}`);
      console.log(`   Details: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('📋 Full error:', error);
  }
}

// Run the migration
applyMigrationViaRest();