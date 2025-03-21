import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { LoginCredentials } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define a simple user type for now
type User = {
  username: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        return await apiRequest({
          method: "POST", 
          path: "/api/login", 
          data: credentials
        });
      } catch (error) {
        console.error("Login error:", error);
        // Provide a user-friendly error message
        throw new Error("Login failed. Please check your credentials and try again.");
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await apiRequest({
          method: "POST", 
          path: "/api/logout", 
          responseType: 'text' // Use text response type to avoid JSON parsing
        });
        return; // Return void as expected
      } catch (error) {
        console.error("Logout error:", error);
        // Force logout on client side even if server request fails
        queryClient.setQueryData(["/api/user"], null);
        // Don't throw - we'll handle it gracefully
        return;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error) => {
      // We won't get here due to our error handling in mutationFn,
      // but keeping it for safety
      console.error("Logout error in onError:", error);
      // Force logout on client side
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Warning",
        description: "Logged out locally, but there may have been a server error.",
        variant: "default",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
