"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GlobalStyles, Box, CircularProgress } from "@mui/material";
import { CssBaseline } from "@mui/material";
import Providers from "@/app/providers"; // Uvezite Providers
import FileUpload from "@/components/FileUpload";
import ToastProvider from "@/components/ToastProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import EmotionCacheProvider from "@/components/EmotionCacheProvider";
import SessionInfo from "@/components/SessionInfo";
import { useTheme } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const updateFavicon = (isLoading: boolean) => {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = isLoading ? "/favicon-loading.ico" : "/favicon.ico";
      }
    };

    const handleStart = () => {
      setIsNavigating(true);
      updateFavicon(true);
    };

    const handleComplete = () => {
      setIsNavigating(false);
      updateFavicon(false);
    };

    handleStart();
    const timer = setTimeout(handleComplete, 1000);

    return () => {
      clearTimeout(timer);
      updateFavicon(false);
    };
  }, [pathname, searchParams]);

  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <GlobalStyles
          styles={{
            body: {
              backgroundColor: resolvedTheme === "dark" ? "#121212 !important" : "#ffffff !important",
            },
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
            "#browser-tab-loader": {
              animation: "spin 1s linear infinite",
              display: "none",
            },
            "[data-navigating] #browser-tab-loader": {
              display: "block",
            },
          }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate icon" id="browser-tab-loader" href="/favicon-loading.ico" />
      </head>
      <body data-navigating={isNavigating || undefined}>
        <Providers> {/* Omotajte aplikaciju sa Providers */}
          <EmotionCacheProvider>
            <CssBaseline />
            <SessionInfo />

            {isNavigating && (
              <Box
                sx={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 9999,
                }}
              >
                <CircularProgress size={60} thickness={4} color="primary" />
              </Box>
            )}

            <Box
              component="main"
              sx={{
                minHeight: "100vh",
                padding: "32px",
                backgroundColor: resolvedTheme === "dark" ? "#121212 !important" : "#ffffff !important",
              }}
            >
              {children}
              <FileUpload />
              <ThemeSwitcher />
            </Box>

            <ToastProvider />
          </EmotionCacheProvider>
        </Providers>
      </body>
    </html>
  );
}
