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
    console.log("Fetching all products:", products.map(p => ({
      ...p,
      images: p.images.map(img => img.substring(0, 50) + '...')
    })));
    res.json(products);
  });

  app.get("/api/products/new-collection", async (req, res) => {
    const products = await storage.getNewCollection();
    res.json(products);
  });

  app.get("/api/products/category/:category", async (req, res) => {
    const products = await storage.getProductsByCategory(req.params.category);
    console.log("Fetching products by category:", req.params.category, products.map(p => ({
      ...p,
      images: p.images.map(img => img.substring(0, 50) + '...')
    })));
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
              console.log("Processed image file, size:", Math.round(base64Url.length / 1024), "KB");
            } else {
              console.log("Unsupported file type:", file.mimetype);
            }
          } catch (error) {
            console.error("Error processing media file:", error);
          }
        }
      }

      // Parse form data
      const productData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        sizes: JSON.parse(req.body.sizes || "[]"),
        colors: JSON.parse(req.body.colors || "[]"),
        images: mediaUrls,
        isNewCollection: req.body.isNewCollection === "true"
      };

      console.log("Creating product with data:", {
        ...productData,
        images: mediaUrls.length > 0 ? mediaUrls.map(url => url.substring(0, 50) + '...') : []
      });

      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData);

      console.log("Created product:", {
        ...product,
        images: product.images.map(img => img.substring(0, 50) + '...')
      });

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