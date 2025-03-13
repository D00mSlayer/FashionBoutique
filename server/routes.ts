import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertProductSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express) {
  app.get("/api/products", async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.get("/api/products/new-collection", async (req, res) => {
    const products = await storage.getNewCollection();
    res.json(products);
  });

  app.get("/api/products/category/:category", async (req, res) => {
    const products = await storage.getProductsByCategory(req.params.category);
    res.json(products);
  });

  app.post("/api/products", upload.array("images", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;

      const productData = insertProductSchema.parse({
        ...req.body,
        images: files ? files.map(
          file => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        ) : [],
        sizes: JSON.parse(req.body.sizes || "[]"),
        colors: JSON.parse(req.body.colors || "[]"),
        isNewCollection: req.body.isNewCollection === "true"
      });

      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof Error) {
        res.status(400).json({ 
          message: "Invalid product data", 
          details: error.message 
        });
      } else {
        res.status(400).json({ message: "Invalid product data" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    await storage.deleteProduct(parseInt(req.params.id));
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}