import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (products) {
      console.log("Received products:", products.length);
      console.log("First product sample:", products[0]);
    }
  }, [products]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <div className="mt-8">
        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className="text-center text-muted-foreground">
            No products found {selectedCategory && `in ${selectedCategory}`}
          </p>
        )}
      </div>
    </div>
  );
}