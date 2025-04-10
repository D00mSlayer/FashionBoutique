import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product, UpdateProduct } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ProductListControls } from "./ProductListControls";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface ProductResponse {
  items: Product[];
  total: number;
  hasMore: boolean;
}

type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";

export default function ProductList() {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [category, setCategory] = useState<string | "all">("all");
  const [showNewCollectionOnly, setShowNewCollectionOnly] = useState(false);

  const { data, isLoading } = useQuery<ProductResponse>({
    queryKey: ["/api/products"],
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Disable garbage collection
    refetchInterval: 0, // Don't automatically refetch
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const { mutate: updateProductSoldOut, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, soldOut }: { id: number; soldOut: boolean }) => {
      try {
        return await apiRequest({
          method: "PATCH", 
          path: `/api/products/${id}`, 
          data: { soldOut }
        });
      } catch (error) {
        console.error("Error updating product:", error);
        // Provide a user-friendly error message
        throw new Error("Server communication error. The database may be temporarily unavailable.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product status updated"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (productId: number) => {
      try {
        return await apiRequest({
          method: "DELETE", 
          path: `/api/products/${productId}`
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        // Provide a user-friendly error message
        throw new Error("Server communication error. The database may be temporarily unavailable.");
      }
    },
    onSuccess: () => {
      // Force a complete cache refresh
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredAndSortedProducts = [...(data?.items || [])]
    .filter(product => {
      if (category !== "all" && product.category !== category) return false;
      if (showNewCollectionOnly && !product.isNewCollection) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const isVideo = (url: string): boolean => {
    if (!url) return false;
    return url.includes('data:video') || url.toLowerCase().endsWith('.mp4');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Products</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="w-24 h-24 bg-muted rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Existing Products</h2>

      <ProductListControls
        sortBy={sortBy}
        onSortChange={setSortBy}
        category={category}
        onCategoryChange={setCategory}
        showNewCollectionOnly={showNewCollectionOnly}
        onNewCollectionChange={setShowNewCollectionOnly}
      />

      <div className="grid gap-4">
        {filteredAndSortedProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Media */}
                {product.media && product.media.length > 0 && (
                  <div className="w-full md:w-auto">
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 pb-2">
                        {product.media.map((item, idx) => (
                          <div key={idx} className="w-32 h-32 flex-shrink-0">
                            {isVideo(item.full) ? (
                              <video
                                src={item.full}
                                className="w-full h-full object-cover rounded-lg"
                                controls
                                muted
                                playsInline
                              />
                            ) : (
                              <img
                                src={item.full}
                                alt={`${product.name} - Image ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-grow space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        product.soldOut 
                          ? 'bg-destructive/20 text-destructive' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {product.soldOut ? 'Sold Out' : 'Available'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.soldOut}
                          onCheckedChange={(checked) => 
                            updateProductSoldOut({ id: product.id, soldOut: checked })
                          }
                          disabled={isUpdating}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {product.soldOut ? 'Mark as Available' : 'Mark as Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <span key={size} className="text-xs bg-muted px-2 py-1 rounded">
                        {size}
                      </span>
                    ))}
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <div className="flex-shrink-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProduct(product.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}