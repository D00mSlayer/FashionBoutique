import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a new pool with explicit SSL settings and a limited number of connections
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 1, // Limit to single connection to prevent connection pooling issues
  idleTimeoutMillis: 0 // Close idle connections immediately
});

// Create drizzle instance with schema
export const db = drizzle(pool, { schema });

// Log connection status
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Ensure clean shutdown
process.on('SIGTERM', () => {
  console.log('Closing all database connections...');
  pool.end();
});