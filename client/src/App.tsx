import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageView } from "@/hooks/use-page-view";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AuthPage from "@/pages/auth-page";
import NewCollection from "@/pages/NewCollection";
import NotFound from "@/pages/not-found";

// Define secure routes with non-obvious names
// These paths should not be included in sitemaps or linked from public pages
const SECURE_ROUTES = {
  // Using obscure paths to prevent easy guessing
  AUTH: "/secure-access-87d31f", 
  ADMIN: "/admin-dashboard-9e5c7b"
};

function Router() {
  // Track page views when route changes
  usePageView();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/new-collection" component={NewCollection} />
          
          {/* Protected routes with obscure paths */}
          <Route path={SECURE_ROUTES.AUTH} component={AuthPage} />
          <ProtectedRoute 
            path={SECURE_ROUTES.ADMIN} 
            component={Admin} 
            loginPath={SECURE_ROUTES.AUTH}
          />
          
          {/* Legacy route redirects - will redirect to the new obscure routes */}
          <Route path="/auth">
            {() => {
              window.location.replace(SECURE_ROUTES.AUTH);
              return null;
            }}
          </Route>
          <Route path="/_dashboard_panel">
            {() => {
              window.location.replace(SECURE_ROUTES.ADMIN);
              return null;
            }}
          </Route>
          
          {/* Catch-all route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;