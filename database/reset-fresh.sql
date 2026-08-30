-- ============================================
-- FRESH DATABASE RESET (33veyora)
-- Ye file SAB DATA DELETE karti hai (structure migrations se wapas banta hai)
-- Run order:
--   1) psql -U postgres -d postgres -f database/reset-fresh.sql
--   2) cd backend && npm run db:migrate
--   3) node src/scripts/create-admin.cjs <email> <password> [name]
-- ============================================

-- Active connections band karo (warna drop fail hoga)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '33veyora' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS "33veyora";
CREATE DATABASE "33veyora";