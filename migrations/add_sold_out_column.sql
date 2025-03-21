-- Migration to add sold_out column to products table
ALTER TABLE products ADD COLUMN sold_out BOOLEAN NOT NULL DEFAULT FALSE;