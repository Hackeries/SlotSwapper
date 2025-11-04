import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    const migrationSQL = readFileSync(
      join(__dirname, '001_init.sql'),
      'utf-8'
    );
    
    await pool.query(migrationSQL);
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
