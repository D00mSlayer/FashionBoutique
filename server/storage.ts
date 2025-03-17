import { products, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getNewCollection(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .orderBy(products.createdAt);
  }

  async getNewCollection(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isNewCollection, true))
      .orderBy(products.createdAt);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.category, category))
      .orderBy(products.createdAt);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

export const storage = new DatabaseStorage();