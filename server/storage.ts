import { products, type Product, type InsertProduct } from "@shared/schema";
import { db, checkDatabaseConnection } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";

const PostgresSessionStore = connectPg(session);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Operation attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      console.log(`Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

      // Check database connection before retry
      const isHealthy = await checkDatabaseConnection();
      if (!isHealthy) {
        throw new Error("Database connection is unhealthy after retry attempts");
      }
    }
  }
  throw new Error("Operation failed after all retry attempts");
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

//Assuming User and InsertUser types are defined elsewhere, likely in @shared/schema
export interface User {
  id: number;
  username: string;
  // ... other user properties
}

export interface InsertUser {
  username: string;
  // ... other user properties for insertion
}


export interface IStorage {
  getAllProducts(page?: number, limit?: number): Promise<PagedResult<Product>>;
  getNewCollection(page?: number, limit?: number): Promise<PagedResult<Product>>;
  getProductsByCategory(category: string, page?: number, limit?: number): Promise<PagedResult<Product>>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getUserByUsername(username: string): Promise<User | null>;
  getUser(id: number): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  private async getCount(query = products): Promise<number> {
    const result = await db.select({
      count: sql<number>`count(*)`
    }).from(query);
    return result[0].count;
  }

  async getAllProducts(page = 1, limit = 12): Promise<PagedResult<Product>> {
    return retryOperation(async () => {
      const offset = (page - 1) * limit;
      console.log("Fetching products page:", page, "limit:", limit, "at:", new Date().toISOString());

      const [items, total] = await Promise.all([
        db.select().from(products)
          .orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        this.getCount()
      ]);

      console.log("Retrieved products count:", items.length, "of total:", total);
      
      // Debug media property
      console.log("Fetching all products:", JSON.stringify(items, null, 2));
      
      // Check if media needs conversion from string to JSON
      const processedItems = items.map(item => {
        // If media is a string (serialized JSON), parse it
        if (typeof item.media === 'string') {
          try {
            return {
              ...item,
              media: JSON.parse(item.media)
            };
          } catch (e) {
            console.error("Error parsing media JSON:", e);
            return item;
          }
        }
        return item;
      });
      
      return {
        items: processedItems,
        total,
        hasMore: offset + items.length < total
      };
    });
  }

  async getNewCollection(page = 1, limit = 12): Promise<PagedResult<Product>> {
    return retryOperation(async () => {
      const offset = (page - 1) * limit;
      console.log("Fetching new collection products page:", page, "at:", new Date().toISOString());

      const baseQuery = db.select().from(products).where(eq(products.isNewCollection, true));
      const [items, total] = await Promise.all([
        baseQuery.orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        this.getCount(baseQuery)
      ]);

      // Check if media needs conversion from string to JSON
      const processedItems = items.map(item => {
        // If media is a string (serialized JSON), parse it
        if (typeof item.media === 'string') {
          try {
            return {
              ...item,
              media: JSON.parse(item.media)
            };
          } catch (e) {
            console.error("Error parsing media JSON:", e);
            return item;
          }
        }
        return item;
      });
      
      return {
        items: processedItems,
        total,
        hasMore: offset + items.length < total
      };
    });
  }

  async getProductsByCategory(category: string, page = 1, limit = 12): Promise<PagedResult<Product>> {
    return retryOperation(async () => {
      const offset = (page - 1) * limit;
      console.log("Fetching products by category:", category, "page:", page, "at:", new Date().toISOString());

      const filteredProducts = db.select().from(products).where(eq(products.category, category));
      const [items, total] = await Promise.all([
        db.select().from(filteredProducts)
          .orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        this.getCount(products)
      ]);

      // Check if media needs conversion from string to JSON
      const processedItems = items.map(item => {
        // If media is a string (serialized JSON), parse it
        if (typeof item.media === 'string') {
          try {
            return {
              ...item,
              media: JSON.parse(item.media)
            };
          } catch (e) {
            console.error("Error parsing media JSON:", e);
            return item;
          }
        }
        return item;
      });
      
      return {
        items: processedItems,
        total,
        hasMore: offset + items.length < total
      };
    });
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    return retryOperation(async () => {
      console.log("Creating new product at:", new Date().toISOString());
      const [product] = await db
        .insert(products)
        .values(insertProduct)
        .returning();

      console.log("Successfully created product:", {
        id: product.id,
        name: product.name,
        createdAt: product.createdAt
      });
      return product;
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return retryOperation(async () => {
      console.log(`Attempting to delete product with ID: ${id} at:`, new Date().toISOString());

      // First verify the product exists
      const existingProducts = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, id));

      if (!existingProducts.length) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // Proceed with deletion
      await db
        .delete(products)
        .where(eq(products.id, id))
        .returning({ deletedId: products.id });

      console.log(`Successfully deleted product ${id}`);
    });
  }

  // User-related methods
  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || null;
  }

  async getUser(id: number): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();