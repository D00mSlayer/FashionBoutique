import { Suspense, lazy } from "react";
import { Loader2, LogOut } from "lucide-react";
import { usePageView } from "@/hooks/use-page-view";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Redirect } from "wouter";

// Lazy load the admin components
const ProductForm = lazy(() => import("@/components/admin/ProductForm"));
const ProductList = lazy(() => import("@/components/admin/ProductList"));

// Secure auth path - must match the one defined in App.tsx
const SECURE_AUTH_PATH = "/secure-access-87d31f";

export default function Admin() {
  // Track page view with generic name for security
  usePageView("Dashboard");
  
  // Get auth context for logout functionality
  const { user, logoutMutation } = useAuth();
  
  // If logout is complete and user is null, redirect to login
  if (logoutMutation.isSuccess && !user) {
    return <Redirect to={SECURE_AUTH_PATH} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={() => logoutMutation.mutate()} 
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Logout
        </Button>
      </div>
      
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