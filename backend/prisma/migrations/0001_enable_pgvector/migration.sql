-- Enable pgvector for Supabase / PostgreSQL (idempotent)
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
