"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Countdown from "react-countdown";
import { Typography, Tooltip, Box } from "@mui/material";

const SessionInfo = () => {
  const { data: session, status } = useSession();
  const [sessionExpiration, setSessionExpiration] = useState<Date | null>(null);

  useEffect(() => {
    if (session?.countdownFormatted) {
      console.log('Session countdownFormatted:', session.countdownFormatted); // Debug log

      const regex = /(\d+) (\d{2}):(\d{2}):(\d{2})/;
      const match = session.countdownFormatted.match(regex);

      if (match) {
        const days = parseInt(match[1], 10);
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3], 10);
        const seconds = parseInt(match[4], 10);

        // Debug logs for parsed values
        console.log(`Parsed - Days: ${days}, Hours: ${hours}, Minutes: ${minutes}, Seconds: ${seconds}`);

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + seconds);
        expiration.setMinutes(expiration.getMinutes() + minutes);
        expiration.setHours(expiration.getHours() + hours);
        expiration.setDate(expiration.getDate() + days);

        setSessionExpiration(expiration);
      } else {
        console.error('Countdown format is invalid:', session.countdownFormatted); // Error if regex doesn't match
      }
    } else {
      console.error('session.countdownFormatted is missing or undefined');
    }
  }, [session?.countdownFormatted]);

  if (status !== "authenticated") return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 8,
        right: 16,
        zIndex: 99999,
        backgroundColor: "#green", 
        color: "white",
        padding: "4px 12px",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      <Tooltip title="Session expiration countdown">
        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: "1.2em" }}>🔐</span>
          {sessionExpiration ? (
            <Countdown
              date={sessionExpiration}
              daysInHours={true}
              renderer={({ days, hours, minutes, seconds }) => (
                <span>{days}d {hours}h {minutes}m {seconds}s</span>
              )}
            />
          ) : (
            "Loading..."
          )}
        </Typography>
      </Tooltip>
    </Box>
  );
};

export default SessionInfo;
