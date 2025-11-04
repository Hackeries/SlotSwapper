#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW() as now, version() as version, current_database() as database')
  .then(res => {
    console.log('✅ DATABASE CONNECTION SUCCESSFUL!\n');
    console.log('Database:', res.rows[0].database);
    console.log('Time:', res.rows[0].now);
    console.log('PostgreSQL:', res.rows[0].version.split(',')[0]);
    console.log('\nYour backend is ready to connect to Supabase!');
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ DATABASE CONNECTION FAILED\n');
    console.log('Error:', err.message);
    console.log('\nPlease check:');
    console.log('1. You have updated DATABASE_URL in backend/.env');
    console.log('2. You are using the Connection Pooler URL from Supabase dashboard');
    console.log('3. Your password is correctly URL-encoded (@ = %40, # = %23)');
    console.log('4. The URL uses an IPv4-enabled endpoint (pooler.supabase.com)');
    pool.end();
    process.exit(1);
  });
