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

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTableManually() {
  try {
    console.log('🚀 Attempting to create tasks table manually...');
    
    // First, let's check if the table already exists by trying to query it
    console.log('🔍 Checking if tasks table exists...');
    const { data: existingTasks, error: checkError } = await supabase
      .from('tasks')
      .select('*')
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
        return true;
      }
    }
    
    console.log('📄 Table does not exist. Since we cannot create tables with the anonymous key,');
    console.log('    the table must be created through the Supabase Dashboard.');
    console.log('');
    console.log('🔧 Manual Setup Required:');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard/project/pmncilppqnzacbplsdti');
    console.log('2. Navigate to: SQL Editor');
    console.log('3. Copy and paste the following SQL:');
    console.log('');
    console.log('----------------------------------------');
    
    // Read and display the migration file
    const migrationPath = join(dirname(fileURLToPath(import.meta.url)), '../supabase/migrations/20251127190350_create_tasks_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('----------------------------------------');
    console.log('');
    console.log('4. Click "Run" to execute the SQL');
    console.log('5. Verify the table was created successfully');
    console.log('');
    console.log('⚠️  Note: You need admin access to the Supabase project to create tables.');
    console.log('   The anonymous key only allows data operations on existing tables.');
    
    return false;
    
  } catch (error) {
    console.error('❌ Error during table check:', error.message);
    return false;
  }
}

// Test if we can insert sample data (if table exists)
async function testTableOperations() {
  try {
    console.log('\n🧪 Testing table operations...');
    
    // Try to insert a test task
    const testTask = {
      title: 'Test Task from Script',
      description: 'This is a test task created by the migration script',
      is_completed: false,
      category: 'Work',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('tasks')
      .insert([testTask])
      .select();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      return false;
    }
    
    console.log('✅ Insert test successful!');
    console.log(`   Created task: ${insertData[0].title}`);
    
    // Try to read all tasks
    const { data: allTasks, error: readError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (readError) {
      console.log('❌ Read test failed:', readError.message);
      return false;
    }
    
    console.log('✅ Read test successful!');
    console.log(`   Found ${allTasks.length} total tasks`);
    
    // Try to update the test task
    const { data: updateData, error: updateError } = await supabase
      .from('tasks')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', insertData[0].id)
      .select();
    
    if (updateError) {
      console.log('❌ Update test failed:', updateError.message);
      return false;
    }
    
    console.log('✅ Update test successful!');
    console.log(`   Marked task as completed: ${updateData[0].title}`);
    
    // Try to delete the test task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.log('❌ Delete test failed:', deleteError.message);
      return false;
    }
    
    console.log('✅ Delete test successful!');
    console.log('   Test task removed');
    
    console.log('\n🎉 All CRUD operations working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ Table operations test failed:', error.message);
    return false;
  }
}

// Run the setup
async function main() {
  const tableExists = await createTableManually();
  
  if (tableExists) {
    const operationsWork = await testTableOperations();
    
    if (operationsWork) {
      console.log('\n✅ Database setup is complete and fully functional!');
      console.log('🚀 Your TaskMaster application is ready to use.');
    } else {
      console.log('\n⚠️  Table exists but operations failed. Check RLS policies.');
    }
  } else {
    console.log('\n⏳ Waiting for manual table creation...');
    console.log('   Run this script again after creating the table in Supabase Dashboard.');
  }
}

main();