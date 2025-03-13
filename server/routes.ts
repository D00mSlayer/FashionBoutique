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
      console.log("Received product data:", req.body);
      console.log("Received files:", req.files);

      const files = req.files as Express.Multer.File[] | undefined;

      const productData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        sizes: Array.isArray(req.body.sizes) ? req.body.sizes : JSON.parse(req.body.sizes || "[]"),
        colors: Array.isArray(req.body.colors) ? req.body.colors : JSON.parse(req.body.colors || "[]"),
        images: files ? files.map(
          file => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        ) : [],
        isNewCollection: req.body.isNewCollection === "true"
      };

      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData);
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