// Temporary file to test error reporting functionality
import { Express } from "express";

export function addErrorTestRoute(app: Express) {
  // Add a route that will always throw an error
  app.get("/api/force-error", (req, res) => {
    console.log("Forcing an error for testing...");
    
    // This will create a reference error, which is a common type of error in JavaScript
    try {
      // @ts-ignore - Intentionally causing an error
      const nonExistentVariable = undefinedVariable.someProperty;
    } catch (error) {
      throw error; // Re-throw to test the global error handler
    }
    
    // This line will never execute
    res.json({ message: "This should never be returned" });
  });
}