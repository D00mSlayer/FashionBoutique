import { ProductCard } from "./ProductCard";
import type { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="space-y-4">
          {/* Image skeleton */}
          <div className="aspect-square bg-muted animate-pulse" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full animate-pulse" />
              <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
            </div>

            {/* Sizes and colors skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="p-4 pt-0">
            <div className="h-9 bg-muted rounded w-full animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}