import { Client } from 'pg';
import 'dotenv/config';

async function main() {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL is required');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS extensions');
    await client.query(
      'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions',
    );
    console.log('pgvector extension is enabled (schema: extensions)');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to enable pgvector:', error);
  process.exit(1);
});
