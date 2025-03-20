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

// Configure connection retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create a new pool with more robust settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 3, // Increase max connections but keep it modest
  connectionTimeoutMillis: 10000, // 10 second timeout
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  maxUses: 7500, // Maximum uses before a connection is destroyed
  allowExitOnIdle: true
});

// Create drizzle instance with schema
export const db = drizzle(pool, { schema });

// Log connection status and handle reconnection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database at:', new Date().toISOString());
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  // Log detailed error information
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
});

// Health check function
export async function checkDatabaseConnection(retries = MAX_RETRIES): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT 1');
      client.release();

      if (result.rows[0]) {
        console.log('Database connection healthy');
        return true;
      }
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  return false;
}

// Ensure clean shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down database connection pool...');
  await pool.end();
});

process.on('SIGINT', async () => {
  console.log('Shutting down database connection pool...');
  await pool.end();
});