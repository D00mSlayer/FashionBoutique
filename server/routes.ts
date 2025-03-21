import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertProductSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { compressImage, compressVideo, isVideo, isImage } from "./utils/mediaProcessor";
import { sendErrorNotification } from "./utils/errorReporting";
import { z } from "zod";
import { addErrorTestRoute } from "./test-route";

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const result = await storage.getAllProducts(page, limit);
    console.log("Fetching all products:", result.items.map(p => ({
      ...p,
      media: `${p.media.length} items`
    })));

    // Transform response to reduce initial payload size
    const lightProducts = result.items.map(product => ({
      ...product,
      // Send both thumbnail and full URLs for immediate display
      media: Array.isArray(product.media) ? product.media.map(item => ({
        thumbnail: item.thumbnail,
        full: item.full // Send full version for image preview
      })) : []
    }));

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      items: lightProducts,
      total: result.total,
      hasMore: result.hasMore
    });
  });

  // Endpoint for lazy loading full-size media
  app.get("/api/products/:id/media/:index", async (req, res) => {
    const productId = parseInt(req.params.id);
    const mediaIndex = parseInt(req.params.index);

    if (isNaN(productId) || isNaN(mediaIndex)) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    const result = await storage.getAllProducts();
    const product = result.items.find(p => p.id === productId);

    if (!product || !product.media[mediaIndex]) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.json({
      full: product.media[mediaIndex].full
    });
  });

  app.get("/api/products/new-collection", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const result = await storage.getNewCollection(page, limit);
    console.log("Fetching new collection products");

    // Transform response for consistency
    const lightProducts = result.items.map(product => ({
      ...product,
      // Send both thumbnail and full URLs for immediate display
      media: Array.isArray(product.media) ? product.media.map(item => ({
        thumbnail: item.thumbnail,
        full: item.full // Send full version for image preview
      })) : []
    }));

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      items: lightProducts,
      total: result.total,
      hasMore: result.hasMore
    });
  });

  app.get("/api/products/category/:category", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const result = await storage.getProductsByCategory(req.params.category, page, limit);
    console.log("Fetching products by category:", req.params.category, result.items.map(p => ({
      ...p,
      media: `${p.media.length} items`
    })));

    // Transform response for consistency
    const lightProducts = result.items.map(product => ({
      ...product,
      // Send both thumbnail and full URLs for immediate display
      media: Array.isArray(product.media) ? product.media.map(item => ({
        thumbnail: item.thumbnail,
        full: item.full // Send full version for image preview
      })) : []
    }));

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      items: lightProducts,
      total: result.total,
      hasMore: result.hasMore
    });
  });

  app.post("/api/products", upload.array("media", 10), async (req, res) => {
    try {
      console.log("Received product data:", req.body);
      console.log("Received files:", req.files?.length, "files");

      const files = req.files as Express.Multer.File[] | undefined;
      const processedMedia = [];

      if (files && files.length > 0) {
        for (const file of files) {
          try {
            if (isVideo(file.mimetype)) {
              const processed = await compressVideo(file.buffer);
              processedMedia.push(processed);
            } else if (isImage(file.mimetype)) {
              const processed = await compressImage(file.buffer);
              processedMedia.push(processed);
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
        sizes: JSON.parse(req.body.sizes || "[]"),
        colors: JSON.parse(req.body.colors || "[]"),
        media: processedMedia,
        tags: JSON.parse(req.body.tags || "[]"),
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

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      console.log("Updating product with ID:", productId, "Data:", req.body);
      
      // Get the existing product to make sure it exists
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update the product (only updating soldOut status for now)
      const updatedProduct = await storage.updateProduct(productId, {
        soldOut: req.body.soldOut !== undefined ? req.body.soldOut : existingProduct.soldOut
      });

      console.log("Successfully updated product:", productId, "Sold out:", updatedProduct.soldOut);
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof Error) {
        res.status(400).json({
          message: "Failed to update product",
          details: error.message
        });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      console.log("Deleting product with ID:", productId);

      await storage.deleteProduct(productId);
      console.log("Successfully deleted product:", productId);

      // Verify deletion
      const products = await storage.getAllProducts();
      console.log("Remaining products:", products.items.length);

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Product not found" });
      } else {
        res.status(500).json({ message: "Failed to delete product" });
      }
    }
  });

  // Client-side error reporting endpoint
  app.post("/api/error-report", async (req, res) => {
    try {
      // Define error report schema
      const errorReportSchema = z.object({
        message: z.string(),
        name: z.string(),
        stack: z.string().optional().nullable(),
        componentStack: z.string().optional().nullable(),
        url: z.string(),
        userAgent: z.string(),
        timestamp: z.string(),
      });

      // Validate request data
      const validationResult = errorReportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid error report format", 
          details: validationResult.error.message 
        });
      }

      console.error("Client-side error reported:", req.body.name, req.body.message);

      // Only send email notification in production
      if (process.env.NODE_ENV === 'production') {
        // Create an Error object from the report data
        const reportedError = new Error(req.body.message);
        reportedError.name = req.body.name;
        reportedError.stack = req.body.stack || undefined;
        
        // Send email notification with detailed information
        await sendErrorNotification(reportedError, {
          subject: `Client Error: ${req.body.name}`,
          stackTrace: req.body.stack || req.body.componentStack,
          additionalInfo: {
            componentStack: req.body.componentStack,
            url: req.body.url,
            userAgent: req.body.userAgent,
            timestamp: req.body.timestamp,
            source: 'client'
          }
        });
      }

      res.status(200).json({ message: "Error report received" });
    } catch (error) {
      console.error("Error processing error report:", error);
      res.status(500).json({ message: "Failed to process error report" });
    }
  });

  // Test endpoint to verify error email notifications (available in all environments for testing)
  app.get("/api/test-error-notification", async (req, res) => {
    try {
      console.log("Testing error notification system...");
      const testError = new Error("This is a test error notification");
      testError.name = "TestError";
      
      await sendErrorNotification(testError, {
        subject: "Test Error Notification",
        additionalInfo: {
          test: true,
          source: 'Test Route',
          environment: process.env.NODE_ENV || 'unknown',
          timestamp: new Date().toISOString()
        }
      });
      
      console.log("Test notification sent successfully");
      res.json({ 
        success: true, 
        message: "Test error notification sent. Check admin email."
      });
    } catch (error) {
      console.error("Failed to send test error notification:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to send test error notification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Add a route that deliberately triggers an error for testing
  addErrorTestRoute(app);
  
  const httpServer = createServer(app);
  return httpServer;
}