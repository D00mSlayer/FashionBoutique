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

// Create a new pool with explicit SSL settings and more robust connection handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 1, // Single connection to prevent pooling issues
  connectionTimeoutMillis: 5000, // 5 second timeout
  idleTimeoutMillis: 0, // Close idle connections immediately
  allowExitOnIdle: true // Allow the pool to exit when all clients have finished
});

// Create drizzle instance with schema
export const db = drizzle(pool, { schema });

// Log connection status
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  // Don't exit process, let the connection retry
});

// Ensure clean shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await pool.end();
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await pool.end();
});