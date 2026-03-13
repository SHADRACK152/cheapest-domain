import postgres from 'postgres';

declare global {
  var __neonSql: postgres.Sql | undefined;
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
}

export function hasNeonDatabase() {
  return Boolean(getDatabaseUrl());
}

export function getNeonSql() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Add your Neon connection string to .env.local.');
  }

  if (!globalThis.__neonSql) {
    globalThis.__neonSql = postgres(databaseUrl, {
      ssl: 'require',
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
    });
  }

  return globalThis.__neonSql;
}
