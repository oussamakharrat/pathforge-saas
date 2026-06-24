#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until node -e "
const { Client } = require('pg');
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const client = new Client({ connectionString: url });
client
  .connect()
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
" >/dev/null 2>&1; do
  sleep 2
done

echo "Starting API server..."
exec "$@"
