import { ProductCard } from "./ProductCard";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {isLoading && products.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground">
          Loading products...
        </div>
      )}
    </div>
  );
}