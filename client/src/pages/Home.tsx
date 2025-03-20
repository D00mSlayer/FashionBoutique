import { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { categories } from "@shared/schema";
import type { Product } from "@shared/schema";

interface ProductResponse {
  items: Product[];
  total: number;
  hasMore: boolean;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async ({ pageParam = 1 }) => {
    const url = selectedCategory
      ? `/api/products/category/${selectedCategory}?page=${pageParam}`
      : `/api/products?page=${pageParam}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json() as Promise<ProductResponse>;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['products', selectedCategory],
    queryFn: fetchProducts,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten all products from all pages
  const allProducts = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? [];
  }, [data]);

  // Get unique sizes and colors from all products
  const { availableSizes, availableColors } = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    allProducts.forEach(product => {
      product.sizes.forEach(size => sizes.add(size));
      product.colors.forEach(color => colors.add(color));
    });
    return {
      availableSizes: Array.from(sizes).sort(),
      availableColors: Array.from(colors).sort()
    };
  }, [allProducts]);

  // Filter products by selected criteria
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Filter by size
      if (selectedSizes.length > 0 && !selectedSizes.some(size => product.sizes.includes(size))) {
        return false;
      }

      // Filter by color
      if (selectedColors.length > 0 && !selectedColors.some(color => product.colors.includes(color))) {
        return false;
      }

      // Filter by new collection
      if (showNewOnly && !product.isNewCollection) {
        return false;
      }

      return true;
    });
  }, [allProducts, selectedSizes, selectedColors, showNewOnly]);

  const handleSizeSelect = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleColorSelect = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading products. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductFilters
        categories={categories}
        sizes={availableSizes}
        colors={availableColors}
        selectedCategory={selectedCategory}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        showNewOnly={showNewOnly}
        onSelectCategory={setSelectedCategory}
        onSelectSize={handleSizeSelect}
        onSelectColor={handleColorSelect}
        onToggleNewOnly={setShowNewOnly}
      />
      <div className="mt-8">
        <ProductGrid 
          products={filteredProducts} 
          isLoading={isLoading}
          category={selectedCategory} 
        />
        {isFetchingNextPage && (
          <div className="text-center py-4">Loading more products...</div>
        )}
        <div ref={loadMoreRef} className="h-10" />
      </div>
    </div>
  );
}