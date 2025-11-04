import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as dns from 'dns';

dotenv.config();

// Force IPv4 first to avoid IPv6 connectivity issues
dns.setDefaultResultOrder('ipv4first');

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please create a .env file in the backend directory with your database credentials.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  },
  // Force IPv4 to avoid IPv6 connectivity issues
  options: '-c search_path=public'
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  console.error('Database connection lost. Please check your connection and restart the server.');
});

// Test database connection with retry logic
export async function testDatabaseConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Testing database connection (attempt ${attempt}/${retries})...`);
      const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
      console.log('✅ Database connected successfully!');
      console.log(`   Time: ${result.rows[0].current_time}`);
      console.log(`   PostgreSQL version: ${result.rows[0].db_version.split(' ')[1]}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Database connection failed (attempt ${attempt}/${retries}):`, error.message);
      
      if (error.code === 'ENOTFOUND') {
        console.error('\n🔍 DNS Resolution Error - Possible causes:');
        console.error('   1. Your Supabase project may be paused or deleted');
        console.error('   2. The database hostname in DATABASE_URL is incorrect');
        console.error('   3. You may have network connectivity issues');
        console.error('\n💡 Solutions:');
        console.error('   - Check if your Supabase project is active at https://supabase.com/dashboard');
        console.error('   - Verify your DATABASE_URL in the .env file');
        console.error('   - If the project is paused, unpause it or create a new project');
        console.error('   - Check your internet connection');
      } else if (error.code === 'ENETUNREACH' && error.message.includes('2406:') || error.message.includes('::')) {
        console.error('\n🔍 IPv6 Network Unreachable - Your Supabase database only supports IPv6!');
        console.error('\n💡 SOLUTION - Use Supabase Connection Pooler:');
        console.error('   1. Go to https://supabase.com/dashboard');
        console.error('   2. Project Settings → Database → Connection Pooling');
        console.error('   3. Copy the Transaction mode connection string (port 6543)');
        console.error('   4. Update DATABASE_URL in .env with the pooler URL');
        console.error('   5. Format: postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('\n🔍 Connection Refused - Possible causes:');
        console.error('   1. Database server is not running');
        console.error('   2. Firewall blocking the connection');
        console.error('   3. Incorrect port number');
      } else if (error.code === '28P01') {
        console.error('\n🔍 Authentication Failed - Possible causes:');
        console.error('   1. Incorrect password in DATABASE_URL');
        console.error('   2. Password needs to be URL-encoded (special characters like @, #, etc.)');
      }
      
      if (attempt < retries) {
        console.log(`⏳ Retrying in 2 seconds...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('\n❌ Failed to connect to database after all retries.');
        console.error('Please check your DATABASE_URL and ensure your Supabase project is active.\n');
        return false;
      }
    }
  }
  return false;
}

export default pool;
