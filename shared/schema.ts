import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  sizes: text("sizes").array().notNull(),
  colors: text("colors").array().notNull(),
  images: text("images").array().notNull(),
  tags: text("tags").array().notNull(),
  isNewCollection: boolean("is_new_collection").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = [
  "Tops",
  "Dresses",
  "Ethnic Wear",
  "Bottoms",
  "Accessories"
] as const;

export const categorySchema = z.enum(categories);

// Base product schema with tag validation
export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true })
  .extend({
    tags: z.array(z.string().transform(val => val.toLowerCase()))
      .default([] as string[])
      .transform(tags => {
        // Ensure array has unique values
        return Array.from(new Set(tags));
      })
  });

export type Category = z.infer<typeof categorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;