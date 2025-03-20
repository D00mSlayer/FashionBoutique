import { products, type Product, type InsertProduct } from "@shared/schema";
import { db, checkDatabaseConnection } from "./db";
import { eq, desc } from "drizzle-orm";

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

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getNewCollection(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    return retryOperation(async () => {
      console.log("Fetching all products from database at:", new Date().toISOString());
      const allProducts = await db.select().from(products)
        .orderBy(desc(products.createdAt));
      console.log("Retrieved products count:", allProducts.length);
      return allProducts;
    });
  }

  async getNewCollection(): Promise<Product[]> {
    return retryOperation(async () => {
      console.log("Fetching new collection products at:", new Date().toISOString());
      return await db.select().from(products)
        .where(eq(products.isNewCollection, true))
        .orderBy(desc(products.createdAt));
    });
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return retryOperation(async () => {
      console.log("Fetching products by category:", category, "at:", new Date().toISOString());
      return await db.select().from(products)
        .where(eq(products.category, category))
        .orderBy(desc(products.createdAt));
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
}

export const storage = new DatabaseStorage();