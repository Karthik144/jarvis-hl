import Navbar from "@/components/navbar";
import { Box, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        <Typography variant="body1" component="p">
          Here you can manage your DeFi activities and monitor your yields.
        </Typography>
      </Box>
    </div>
  );
}
