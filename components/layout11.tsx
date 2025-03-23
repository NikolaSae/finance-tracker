"use client";

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Box, CircularProgress, CssBaseline } from "@mui/material"
import { SessionProvider } from "next-auth/react"
import EmotionCacheProvider from "./EmotionCacheProvider"
import ToastProvider from "./ToastProvider"
import Navbar from "./Navbar"
import FileUpload from "./FileUpload"
import ThemeSwitcher from "./ThemeSwitcher"
import SessionInfo from "./SessionInfo"
import { useTheme } from "next-themes"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const updateFavicon = (isLoading: boolean) => {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (link) {
        link.href = isLoading ? "/favicon-loading.ico" : "/favicon.ico"
      }
    }

    const handleStart = () => {
      setIsNavigating(true)
      updateFavicon(true)
    }

    const handleComplete = () => {
      setIsNavigating(false)
      updateFavicon(false)
    }

    handleStart()
    const timer = setTimeout(handleComplete, 1000)

    return () => {
      clearTimeout(timer)
      updateFavicon(false)
    }
  }, [pathname, searchParams])

  return (
    <SessionProvider>
      <EmotionCacheProvider>
        <CssBaseline />
        <Navbar />
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
            backgroundColor: resolvedTheme === "dark" ? "#121212" : "#ffffff",
          }}
        >
          {children}
          <FileUpload />
          <ThemeSwitcher />
        </Box>

        <ToastProvider />
      </EmotionCacheProvider>
    </SessionProvider>
  )
}