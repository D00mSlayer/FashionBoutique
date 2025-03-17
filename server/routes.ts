import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertProductSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { compressImage, compressVideo, isVideo, isImage } from "./utils/mediaProcessor";

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
  }
});

export async function registerRoutes(app: Express) {
  app.get("/api/products", async (req, res) => {
    const products = await storage.getAllProducts();
    console.log("Fetching all products:", products);
    res.json(products);
  });

  app.get("/api/products/new-collection", async (req, res) => {
    const products = await storage.getNewCollection();
    res.json(products);
  });

  app.get("/api/products/category/:category", async (req, res) => {
    const products = await storage.getProductsByCategory(req.params.category);
    console.log("Fetching products by category:", req.params.category, products);
    res.json(products);
  });

  app.post("/api/products", upload.array("media", 10), async (req, res) => {
    try {
      console.log("Received product data:", req.body);
      console.log("Received files:", req.files?.length);

      const files = req.files as Express.Multer.File[] | undefined;
      const mediaUrls: string[] = [];

      // Process and compress media files
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            if (isVideo(file.mimetype)) {
              const videoUrl = await compressVideo(file.buffer);
              mediaUrls.push(videoUrl);
              console.log("Processed video file");
            } else if (isImage(file.mimetype)) {
              const compressedBuffer = await compressImage(file.buffer);
              const base64Url = `data:${file.mimetype};base64,${compressedBuffer.toString("base64")}`;
              mediaUrls.push(base64Url);
              console.log("Processed image file, length:", base64Url.length);
            }
          } catch (error) {
            console.error("Error processing media file:", error);
          }
        }
      }

      const productData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        sizes: Array.isArray(req.body.sizes) ? req.body.sizes : JSON.parse(req.body.sizes || "[]"),
        colors: Array.isArray(req.body.colors) ? req.body.colors : JSON.parse(req.body.colors || "[]"),
        images: mediaUrls,
        isNewCollection: req.body.isNewCollection === "true"
      };

      console.log("Parsed product data:", {
        ...productData,
        images: productData.images.map(url => url.substring(0, 50) + '...')
      });

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