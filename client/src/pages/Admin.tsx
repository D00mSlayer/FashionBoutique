import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the admin components
const ProductForm = lazy(() => import("@/components/admin/ProductForm"));
const ProductList = lazy(() => import("@/components/admin/ProductList"));

export default function Admin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="space-y-8">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          }
        >
          <div className="max-w-2xl">
            <ProductForm />
          </div>
          <ProductList />
        </Suspense>
      </div>
    </div>
  );
}