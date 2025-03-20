import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add cache busting parameter for GET requests
  const urlWithNoCaching = method === 'GET' 
    ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
    : url;

  const res = await fetch(urlWithNoCaching, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Add cache control headers
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add cache busting parameter
    const url = queryKey[0] as string;
    const urlWithNoCaching = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;

    const res = await fetch(urlWithNoCaching, {
      credentials: "include",
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 0,
      refetchOnWindowFocus: true,
      staleTime: 0, // Consider all data stale immediately
      gcTime: 0, // Disable garbage collection
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});