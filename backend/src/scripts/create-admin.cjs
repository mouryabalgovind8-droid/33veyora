// ============================================
// Create or update an ADMIN account
// Usage: node src/scripts/create-admin.cjs <email> <password> [name]
// Example: node src/scripts/create-admin.cjs admin@site.com MyPass@123 "Main Admin"
// ============================================
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Load env vars (same resolution order as src/config/database.ts)
for (const p of [path.join(process.cwd(), '..', '.env'), path.join(process.cwd(), '.env')]) {
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}

const pool = new Pool({
  host: process.env.PG_HOST || '127.0.0.1',
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || '33veyora',
});

const [email, password, name = 'Admin'] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: node src/scripts/create-admin.cjs <email> <password> [name]');
  process.exit(1);
}

(async () => {
  const hash = bcrypt.hashSync(password, 10);
  const id = 'admin-' + Date.now();
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password, role, is_active)
     VALUES ($1, $2, $3, $4, 'admin', 1)
     ON CONFLICT (email) DO UPDATE
       SET password = EXCLUDED.password, role = 'admin', is_active = 1
     RETURNING id, name, email, role`,
    [id, name, email, hash]
  );
  console.log('ADMIN READY:', JSON.stringify(result.rows[0]));
  await pool.end();
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});