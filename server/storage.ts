import { products, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getNewCollection(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    try {
      const allProducts = await db.select().from(products)
        .orderBy(desc(products.createdAt));
      console.log("Retrieved all products:", allProducts);
      return allProducts;
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  }

  async getNewCollection(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isNewCollection, true))
      .orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.category, category))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    console.log(`Attempting to delete product with ID: ${id}`);
    try {
      // First verify the product exists
      const existingProducts = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, id));

      if (!existingProducts.length) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // Proceed with deletion
      const result = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning({ deletedId: products.id });

      console.log("Delete operation result:", result);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();