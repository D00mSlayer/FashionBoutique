import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    } catch (error) {
      // If we can't read the response text, just use the status text
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest({
  method,
  path,
  data,
  headers = {},
  responseType = 'json'
}: {
  method: string;
  path: string;
  data?: unknown;
  headers?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
}): Promise<any> {
  // Add cache busting parameter for GET requests
  const urlWithNoCaching = method === 'GET' 
    ? `${path}${path.includes('?') ? '&' : '?'}_t=${Date.now()}`
    : path;

  const res = await fetch(urlWithNoCaching, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Add cache control headers
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...headers
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Handle empty responses safely
  if (res.status === 204 || res.headers.get('Content-Length') === '0') {
    // Return null or empty object for no content responses
    return responseType === 'json' ? {} : null;
  }
  
  try {
    // Return the appropriate response format based on responseType
    if (responseType === 'json') {
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } else if (responseType === 'text') {
      return await res.text();
    } else if (responseType === 'blob') {
      return await res.blob();
    } else if (responseType === 'arrayBuffer') {
      return await res.arrayBuffer();
    } else if (responseType === 'formData') {
      return await res.formData();
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    if (responseType === 'json') {
      return {}; // Return empty object for JSON parse errors
    }
    throw error;
  }
  
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
    
    // Handle empty responses safely
    if (res.status === 204 || res.headers.get('Content-Length') === '0') {
      return {}; // Return empty object for no content responses
    }
    
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error('Error parsing response:', error);
      return {}; // Return empty object for JSON parse errors
    }
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