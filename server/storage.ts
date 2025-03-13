import { products, type Product, type InsertProduct } from "@shared/schema";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getNewCollection(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private currentId: number;

  constructor() {
    this.products = new Map();
    this.currentId = 1;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNewCollection(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.isNewCollection)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      isNewCollection: insertProduct.isNewCollection ?? false, // Ensure it's always a boolean
    };
    this.products.set(id, product);
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    if (!this.products.delete(id)) {
      throw new Error(`Product with id ${id} not found`);
    }
  }
}

export const storage = new MemStorage();