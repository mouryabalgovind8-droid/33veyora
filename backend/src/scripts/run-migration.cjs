const pg = require('pg');
const fs = require('fs');
const path = require('path');
const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'Pmh81@sun', database: 'havenhorizon' });

async function runMigration() {
  const sqlPath = path.join(__dirname, '../../../database/migrations/002_add_brd_features.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('Running migration 002...');
  await pool.query(sql);
  console.log('✅ Migration 002 completed successfully!');
  
  await pool.end();
}

runMigration().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
