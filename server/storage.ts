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

export interface PagedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface IStorage {
  getAllProducts(page?: number, limit?: number): Promise<PagedResult<Product>>;
  getNewCollection(page?: number, limit?: number): Promise<PagedResult<Product>>;
  getProductsByCategory(category: string, page?: number, limit?: number): Promise<PagedResult<Product>>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private async getCount(query: any): Promise<number> {
    const [result] = await db.select({ count: db.fn.count() }).from(query);
    return Number(result.count);
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
        this.getCount(products)
      ]);

      console.log("Retrieved products count:", items.length, "of total:", total);
      return {
        items,
        total,
        hasMore: offset + items.length < total
      };
    });
  }

  async getNewCollection(page = 1, limit = 12): Promise<PagedResult<Product>> {
    return retryOperation(async () => {
      const offset = (page - 1) * limit;
      console.log("Fetching new collection products page:", page, "at:", new Date().toISOString());

      const query = db.select().from(products).where(eq(products.isNewCollection, true));
      const [items, total] = await Promise.all([
        query.orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        this.getCount(query)
      ]);

      return {
        items,
        total,
        hasMore: offset + items.length < total
      };
    });
  }

  async getProductsByCategory(category: string, page = 1, limit = 12): Promise<PagedResult<Product>> {
    return retryOperation(async () => {
      const offset = (page - 1) * limit;
      console.log("Fetching products by category:", category, "page:", page, "at:", new Date().toISOString());

      const query = db.select().from(products).where(eq(products.category, category));
      const [items, total] = await Promise.all([
        query.orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        this.getCount(query)
      ]);

      return {
        items,
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
}

export const storage = new DatabaseStorage();