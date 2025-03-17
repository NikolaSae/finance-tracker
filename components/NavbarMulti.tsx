import { Button, Box } from "@mui/material";

interface NavbarMultiProps {
  activeView: string;
  setActiveView: (view: string) => void;
  viewsConfig: { name: string; title: string }[];
}

export default function NavbarMulti({ activeView, setActiveView, viewsConfig }: NavbarMultiProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      {viewsConfig.map((view) => (
        <Button
          key={view.name}
          variant={activeView === view.name ? "contained" : "outlined"}
          onClick={() => setActiveView(view.name)}
        >
          {view.title}
        </Button>
      ))}
    </Box>
  );
}


