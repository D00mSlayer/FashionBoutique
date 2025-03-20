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
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ProductListControls } from "./ProductListControls";
import { useState } from "react";

type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";

export function ProductList() {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [category, setCategory] = useState<string | "all">("all");
  const [showNewCollectionOnly, setShowNewCollectionOnly] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Disable garbage collection
    refetchInterval: 0, // Don't automatically refetch
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("DELETE", `/api/products/${productId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete product");
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

  const filteredAndSortedProducts = [...products]
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
            <CardContent className="p-4 flex items-center">
              {/* Product Image */}
              {product.images && product.images.length > 0 && (
                <div className="w-24 h-24 mr-4 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images[0].startsWith('data:video') ? (
                    <video
                      src={product.images[0]}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              {/* Product Info */}
              <div className="flex-grow">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.sizes.map((size) => (
                    <span key={size} className="text-xs bg-muted px-2 py-1 rounded">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="ml-4"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}