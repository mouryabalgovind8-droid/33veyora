import pg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load env vars so standalone CLI usage (db:migrate / db:seed) works too
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config();

const { Pool } = pg;

// PostgreSQL connection config — support DATABASE_URL (Railway/Render/Supabase)
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: 20 })
  : new Pool({
      host: process.env.PG_HOST || '127.0.0.1',
      port: parseInt(process.env.PG_PORT || '5432'),
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || '',
      database: process.env.PG_DATABASE || '33veyora',
      max: 20,
    });

// Test connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// Get the pool (controllers use this)
export function getDatabase(): pg.Pool {
  return pool;
}

// Close database
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('📦 PostgreSQL pool closed');
}

// Reset database (for tests)
export async function resetDatabase(): Promise<void> {
  // Drop all tables
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);
    for (const row of result.rows) {
      await client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
    }
  } finally {
    client.release();
  }
}

// Get migrations directory
function getMigrationsDir(): string {
  const candidates = [
    path.join(process.cwd(), '..', 'database', 'migrations'),
    path.join(process.cwd(), 'database', 'migrations'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }

  return candidates[0];
}

function getSeedsDir(): string {
  const candidates = [
    path.join(process.cwd(), '..', 'database', 'seeds'),
    path.join(process.cwd(), 'database', 'seeds'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }

  return candidates[0];
}

// Run migrations
export async function runMigrations(): Promise<void> {
  const migrationsDir = getMigrationsDir();

  if (!fs.existsSync(migrationsDir)) {
    console.log('📁 No migrations directory found at:', migrationsDir);
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`🔄 Running migration: ${file}`);
      await client.query(sql);
    }
    console.log('✅ All migrations completed');
  } finally {
    client.release();
  }
}

// Run seeds
export async function runSeeds(): Promise<void> {
  const seedsDir = getSeedsDir();

  if (!fs.existsSync(seedsDir)) {
    console.log('📁 No seeds directory found at:', seedsDir);
    return;
  }

  // Check if data already seeded
  const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
  const count = parseInt(countResult.rows[0].count);
  if (count > 0) {
    console.log('⏭️  Seeds already applied, skipping');
    return;
  }

  const client = await pool.connect();
  try {
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`🌱 Running seed: ${file}`);
      await client.query(sql);
    }
    console.log('✅ All seeds completed');
  } finally {
    client.release();
  }
}

// Initialize database with migrations and seeds
export async function initializeDatabase(): Promise<void> {
  console.log('🚀 Initializing database...');
  await runMigrations();
  await runSeeds();
  console.log('✅ Database ready');
}

// CLI support: `npm run db:migrate` / `npm run db:seed`
const cliArgs = process.argv.slice(2);
if (cliArgs.includes('migrate')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
} else if (cliArgs.includes('seed')) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
