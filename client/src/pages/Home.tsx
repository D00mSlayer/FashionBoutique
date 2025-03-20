import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import type { Product } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: selectedCategory 
      ? [`/api/products/category/${selectedCategory}`]
      : ["/api/products"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <div className="mt-8">
        <ProductGrid 
          products={products || []} 
          isLoading={isLoading}
          category={selectedCategory} 
        />
      </div>
    </div>
  );
}