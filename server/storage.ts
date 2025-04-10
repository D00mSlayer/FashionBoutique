import { products, type Product, type InsertProduct, type UpdateProduct } from "@shared/schema";
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
export interface IStorage {
  getAllProducts(page?: number, limit?: number): Promise<PagedResult<Product>>;
  getNewCollection(page?: number, limit?: number): Promise<PagedResult<Product>>;
  getProductsByCategory(category: string, page?: number, limit?: number): Promise<PagedResult<Product>>;
  getProduct(id: number): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: UpdateProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  sessionStore: session.Store;
}

// Function to get media data from the database
async function getProductMediaFromDB(productId: number) {
  try {
    // Query the raw media value from database
    const result = await db.execute<{ media: string }>(
      sql`SELECT media FROM products WHERE id = ${productId}`
    );

    // Safely access results from the query
    const rows = result.rows;
    if (rows && rows.length > 0 && rows[0]?.media) {
      try {
        return JSON.parse(rows[0].media);
      } catch (e) {
        console.error("Error parsing media JSON from DB:", e);
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error("Error getting media from DB:", error);
    return [];
  }
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

  private async getCount(): Promise<number> {
    // Simple count of all products
    const result = await db.select({
      count: sql<number>`count(*)`
    }).from(products);
    return result[0].count;
  }

  async getAllProducts(page = 1, limit = 12): Promise<PagedResult<Product>> {
    return retryOperation(async () => {
      const offset = (page - 1) * limit;
      console.log("Fetching products page:", page, "limit:", limit, "at:", new Date().toISOString());

      const [items, total] = await Promise.all([
        db.select().from(products)
          // Order by sold_out status (false first) then by creation date (newest first)
          .orderBy(products.soldOut, desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        this.getCount()
      ]);

      console.log("Retrieved products count:", items.length, "of total:", total);
      
      // Process the media data in products
      const processedItems = items.map(item => {
        if (typeof item.media === 'object') {
          // Already properly formed
          return item;
        } else if (typeof item.media === 'string') {
          const mediaStr = item.media as string;
          if (mediaStr.startsWith('[{')) {
            // It's a JSON string, parse it
            try {
              return {
                ...item,
                media: JSON.parse(mediaStr)
              };
            } catch (e) {
              console.error("Error parsing media JSON:", e);
              return item;
            }
          } else if (mediaStr.includes('items')) {
            // Get the actual media from DB
            return getProductMediaFromDB(item.id)
              .then(mediaData => {
                return {
                  ...item,
                  media: mediaData
                };
              })
              .catch(err => {
                console.error(`Error getting media for product ${item.id}:`, err);
                return item;
              });
          }
        }
        return item;
      });
      
      // Handle potential promises in processedItems
      const resolvedItems = await Promise.all(processedItems);
      
      return {
        items: resolvedItems,
        total,
        hasMore: offset + items.length < total
      };
    });
  }

  async getNewCollection(page = 1, limit = 12): Promise<PagedResult<Product>> {
    return retryOperation(async () => {
      const offset = (page - 1) * limit;
      console.log("Fetching new collection products page:", page, "at:", new Date().toISOString());

      // Execute a direct count query for new collection items
      const countQuery = await db.select({
        count: sql<number>`count(*)`
      })
      .from(products)
      .where(eq(products.isNewCollection, true));
      
      const total = countQuery[0].count;
      
      // Then fetch the actual data
      const items = await db.select()
        .from(products)
        .where(eq(products.isNewCollection, true))
        // Order by sold_out status (false first) then by creation date (newest first)
        .orderBy(products.soldOut, desc(products.createdAt))
        .limit(limit)
        .offset(offset);

      // Check if media needs conversion from string to JSON
      const processedItems = items.map(item => {
        // If media is a string (serialized JSON), parse it
        if (typeof item.media === 'string') {
          const mediaStr = item.media as string;
          try {
            return {
              ...item,
              media: JSON.parse(mediaStr)
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

      // Execute a direct count query with the same category filter
      const countQuery = await db.select({
        count: sql<number>`count(*)`
      })
      .from(products)
      .where(eq(products.category, category));
      
      const total = countQuery[0].count;
      
      // Then fetch the actual data with the same filter
      const items = await db.select()
        .from(products)
        .where(eq(products.category, category))
        // Order by sold_out status (false first) then by creation date (newest first)
        .orderBy(products.soldOut, desc(products.createdAt))
        .limit(limit)
        .offset(offset);

      // Check if media needs conversion from string to JSON
      const processedItems = items.map(item => {
        // If media is a string (serialized JSON), parse it
        if (typeof item.media === 'string') {
          const mediaStr = item.media as string;
          try {
            return {
              ...item,
              media: JSON.parse(mediaStr)
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

  async getProduct(id: number): Promise<Product | null> {
    return retryOperation(async () => {
      console.log(`Fetching product with ID: ${id} at:`, new Date().toISOString());
      
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      
      if (!result.length) {
        return null;
      }
      
      let product = result[0];
      
      // Handle media data if needed
      if (typeof product.media === 'string') {
        const mediaStr = product.media as string;
        try {
          product = {
            ...product,
            media: JSON.parse(mediaStr)
          };
        } catch (e) {
          console.error(`Error parsing media for product ${id}:`, e);
        }
      }
      
      return product;
    });
  }
  
  async updateProduct(id: number, updateData: UpdateProduct): Promise<Product> {
    return retryOperation(async () => {
      console.log(`Updating product with ID: ${id} at:`, new Date().toISOString());
      
      // First verify the product exists
      const existingProducts = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      
      if (!existingProducts.length) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      // Proceed with update
      const [updatedProduct] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();
      
      console.log(`Successfully updated product ${id}`);
      
      // Handle media data if needed
      if (typeof updatedProduct.media === 'string') {
        try {
          return {
            ...updatedProduct,
            media: JSON.parse(updatedProduct.media)
          };
        } catch (e) {
          console.error(`Error parsing media for updated product ${id}:`, e);
        }
      }
      
      return updatedProduct;
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

  // Authentication is handled via environment variables, not database
}

export const storage = new DatabaseStorage();