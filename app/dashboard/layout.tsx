"use client";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { Typography, Tooltip, Box, CircularProgress } from "@mui/material";
import Navbar from "../../components/Navbar";  // Pretpostavljamo da imaš Navbar komponentu

// Komponenta za session info
const SessionInfo = ({ session }) => {
  const [sessionExpiration, setSessionExpiration] = useState<Date | null>(null);

  useEffect(() => {
    if (session?.countdownFormatted) {
      const regex = /(\d+) (\d{2}):(\d{2}):(\d{2})/;
      const match = session.countdownFormatted.match(regex);

      if (match) {
        const days = parseInt(match[1], 10);
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3], 10);
        const seconds = parseInt(match[4], 10);

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + seconds);
        expiration.setMinutes(expiration.getMinutes() + minutes);
        expiration.setHours(expiration.getHours() + hours);
        expiration.setDate(expiration.getDate() + days);

        setSessionExpiration(expiration);
      }
    }
  }, [session?.countdownFormatted]);

  if (!session || session.status !== "authenticated") return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 8,
        right: 16,
        zIndex: 99999,
        backgroundColor: "#4caf50", 
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

// Tvoje dodatne komponente
import FileUpload from "../../components/FileUpload";
import ThemeSwitcher from "../../components/providers/ThemeSwitcher";

// Dashboard Layout with additional components
export default function DashboardLayout({ children, session, status }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulacija učitavanja
    if (session) {
      setLoading(false);
    }
  }, [session]);

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Dodajemo SessionInfo */}
      <SessionInfo session={session} />

      {/* Dodajemo Circular Progress ako se učitava */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
          <CircularProgress />
        </Box>
      ) : (
        // Dodajemo FileUpload i ThemeSwitcher kada je učitavanje završeno
        <Box sx={{ padding: "16px", marginTop: "80px" }}>
          <FileUpload />
          <ThemeSwitcher />
        </Box>
      )}

      {/* Ostatak sadržaja dashboard-a */}
      <div>
        <h1>Welcome to the Dashboard, {session?.user?.name}</h1>
        <p>Some other dashboard content...</p>
        
        {/* Ovo renderuje sve komponente koje su prosleđene kao children */}
        {children}
      </div>
    </div>
  );
}
