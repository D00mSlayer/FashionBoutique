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
      console.log("Fetching all products from database at:", new Date().toISOString());
      const allProducts = await db.select().from(products)
        .orderBy(desc(products.createdAt));
      console.log("Retrieved products count:", allProducts.length);
      console.log("Products data:", allProducts.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt })));
      return allProducts;
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  }

  async getNewCollection(): Promise<Product[]> {
    console.log("Fetching new collection products at:", new Date().toISOString());
    return await db.select().from(products)
      .where(eq(products.isNewCollection, true))
      .orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    console.log("Fetching products by category:", category, "at:", new Date().toISOString());
    return await db.select().from(products)
      .where(eq(products.category, category))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      console.log("Creating new product at:", new Date().toISOString());
      console.log("Product data:", {
        ...insertProduct,
        images: insertProduct.images.length + " images"
      });

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
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    console.log(`Attempting to delete product with ID: ${id} at:`, new Date().toISOString());
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