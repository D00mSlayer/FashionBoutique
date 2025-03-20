import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export interface MediaItem {
  thumbnail: string;
  full: string;
}

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  sizes: text("sizes").array().notNull(),
  colors: text("colors").array().notNull(),
  media: jsonb("media").notNull().$type<MediaItem[]>(),
  tags: text("tags").array().notNull(),
  isNewCollection: boolean("is_new_collection").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
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

export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true })
  .extend({
    media: z.array(z.object({
      thumbnail: z.string(),
      full: z.string()
    })),
    tags: z.array(z.string().transform(val => val.toLowerCase()))
      .default([])
      .transform(tags => Array.from(new Set(tags)))
  });

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters long")
  });

export type Category = z.infer<typeof categorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;