-- Creates the mem0_app database used by the Mem0 API for
-- user/auth/api-key data. Runs automatically on first Postgres start
-- via /docker-entrypoint-initdb.d. The vector memory store lives in
-- the main database (POSTGRES_DB).
SELECT 'CREATE DATABASE mem0_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mem0_app')\gexec
