import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <ProtectedRoute path="/_dashboard_panel" component={Admin} />
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