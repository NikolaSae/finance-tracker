"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Typography, Tooltip, Box } from "@mui/material";

const SessionInfo = () => {
  const { data: session, status, update } = useSession(); // Sada će raditi bez greške
  const [timeLeft, setTimeLeft] = useState<string>("00h 00m");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const calculateTime = () => {
      if (session?.expires) {
        const expiration = new Date(session.expires);
        const now = new Date();
        const diff = expiration.getTime() - now.getTime();
        
        const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
        
        setTimeLeft(`${hours}h ${minutes}m`);
        setDebugInfo(`Exp: ${session.expires} | Now: ${now.toISOString()}`);
        
        // Аутоматско освежавање сесије
        if (diff < 5 * 60 * 1000) { // 5 минута пре истека
          update();
        }
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [session, update]);

  if (status !== "authenticated") return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 8,
        right: 16,
        zIndex: 99999,
        backgroundColor: "#1976d2",
        color: "white",
        padding: "4px 12px",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      <Tooltip title={
        <div>
          <div>{debugInfo}</div>
          <div>User ID: {session.user.id}</div>
          <div>Role: {session.user.role}</div>
        </div>
      }>
        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: "1.2em" }}>🔐</span>
          <span>{timeLeft}</span>
        </Typography>
      </Tooltip>
    </Box>
  );
};

export default SessionInfo;