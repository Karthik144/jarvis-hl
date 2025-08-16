"use client";

import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { GlowOrb } from "../components/orb";
import { BoxStyles, ButtonStyles } from "./constants";
import Navbar from "../components/navbar";

export default function Home() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <div>
      <Navbar />
      <Box sx={BoxStyles}>
        <GlowOrb size={150} color="rgba(100, 200, 255, 0.3)" top="15%" />

        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 500, pt: 8 }}
        >
          Hey, I’m Jarvis{" "}
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </Typography>

        <Typography variant="h5" component="p" gutterBottom>
          I can optimize your DeFi yield for you.
        </Typography>

        <Typography
          variant="body1"
          component="p"
          sx={{ fontStyle: "italic", color: "gray", marginBottom: 4 }}
        >
          No manual tweaking needed – just set it and forget it.
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={ButtonStyles}
          onClick={handleClickOpen}
        >
          Get Started
        </Button>
      </Box>
    </div>
  );
}
