"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import ThemeSwitcher from "@/components/providers/ThemeSwitcher";
import SessionInfo from "@/components/SessionInfo";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const { data: session, status } = useSession();

  // Favicon i loading logika
  useEffect(() => {
    const updateFavicon = (isLoading: boolean) => {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      link.href = isLoading ? "/favicon-loading.ico" : "/favicon.ico";
    };

    const handleNavigation = () => {
      setIsNavigating(true);
      updateFavicon(true);
      setTimeout(() => {
        setIsNavigating(false);
        updateFavicon(false);
      }, 1000);
    };

    handleNavigation();
  }, [pathname, searchParams]);

  if (status === "loading") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <SessionInfo />
        
        {isNavigating && (
          <Box sx={{ 
            position: "fixed", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            zIndex: 9999 
          }}>
            <CircularProgress size={60} thickness={4} color="primary" />
          </Box>
        )}

        {children}
        <FileUpload />
        <ThemeSwitcher />
      </Box>
    </Box>
  );
}