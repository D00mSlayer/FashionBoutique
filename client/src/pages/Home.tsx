import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { TagFilter } from "@/components/products/TagFilter";
import type { Product } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: selectedCategory 
      ? [`/api/products/category/${selectedCategory}`]
      : ["/api/products"],
  });

  // Get unique tags from all products
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(product => {
      product.tags.forEach(tag => {
        // Don't include category tags in the filter
        if (!tag.endsWith('-category')) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags);
  }, [products]);

  // Filter products by selected tags
  const filteredProducts = useMemo(() => {
    if (selectedTags.length === 0) return products;
    return products.filter(product =>
      selectedTags.every(tag => product.tags.includes(tag))
    );
  }, [products, selectedTags]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {availableTags.length > 0 && (
        <TagFilter
          tags={availableTags}
          selectedTags={selectedTags}
          onSelectTag={handleTagSelect}
        />
      )}
      <div className="mt-8">
        <ProductGrid 
          products={filteredProducts} 
          isLoading={isLoading}
          category={selectedCategory} 
        />
      </div>
    </div>
  );
}