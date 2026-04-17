import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/router";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: "Inter, system-ui, sans-serif" },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
