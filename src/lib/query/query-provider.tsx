"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// App-wide TanStack Query provider with shared cache defaults.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState (not useMemo) ensures the client is created once per app instance
  // and never recreated across re-renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // data considered fresh for 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
