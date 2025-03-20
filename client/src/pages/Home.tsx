import { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { TagFilter } from "@/components/products/TagFilter";
import type { Product } from "@shared/schema";

interface ProductResponse {
  items: Product[];
  total: number;
  hasMore: boolean;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  // Get unique tags from all products
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    allProducts.forEach(product => {
      product.tags.forEach(tag => {
        // Don't include category tags in the filter
        if (!tag.endsWith('-category')) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags);
  }, [allProducts]);

  // Filter products by selected tags
  const filteredProducts = useMemo(() => {
    if (selectedTags.length === 0) return allProducts;
    return allProducts.filter(product =>
      selectedTags.every(tag => product.tags.includes(tag))
    );
  }, [allProducts, selectedTags]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
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
        {isFetchingNextPage && (
          <div className="text-center py-4">Loading more products...</div>
        )}
        <div ref={loadMoreRef} className="h-10" />
      </div>
    </div>
  );
}