"use client";

import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeProvider from "./ThemeProvider";
import ToastProvider from "@/components/ToastProvider"; // Uvozimo ToastProvider
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Dodajemo import za ThemeSwitcher i FileUpload
import ThemeSwitcher from "@/components/providers/ThemeSwitcher";
import FileUpload from "@/components/FileUpload";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 60 * 1000,
    },
  },
});

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleNavigation = () => {
      setIsNavigating(true);
      setTimeout(() => setIsNavigating(false), 1000);
    };
    handleNavigation();
  }, [pathname, searchParams]);

  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <ToastProvider>
              {isNavigating && (
                <div className="global-loader">
                  <div className="spinner" />
                </div>
              )}
              <main className="main-content">
                {/* Dodajemo ThemeSwitcher i FileUpload ovde */}
                <ThemeSwitcher />
                <FileUpload />
                {children}
              </main>
            </ToastProvider>
          </ErrorBoundary>
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
