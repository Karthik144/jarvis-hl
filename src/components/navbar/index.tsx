"use client";

import React, { useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { ButtonStyles, AppBarStyles } from "./constants";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartAccount } from "@/utils/useSmartAccount";
import { findOrCreateUser } from "@/utils/findOrCreateUser";

export default function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { smartWalletAddress } = useSmartAccount();

  const router = useRouter();

  const isSignedIn = ready && authenticated;

  // Note: Privy login method doesn't reutrn a promise so we need to handle the navigation manually
  // To-Do: Use our own UI for login instead of Privy's
  useEffect(() => {
    const handleUserSession = async () => {
      if (isSignedIn && user?.wallet?.address) {
        console.log("User is authenticated, checking database...");
        await Promise.all([findOrCreateUser(user.wallet.address)]);
        // router.push("/dashboard");
      }
    };

    handleUserSession();
  }, [isSignedIn, router, user?.wallet?.address]);

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed with an error:", error);
      // To-Do: Show a toast with the error message
    }
  };

  return (
    <AppBar position="static" elevation={0} sx={AppBarStyles}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            color: "text.primary",
          }}
        >
          Jarvis
        </Typography>
        {/* Smart Wallet Address Display */}
        <Box sx={{ mx: 2 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {smartWalletAddress
              ? `Smart Wallet: ${smartWalletAddress}`
              : "No Smart Wallet"}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={ButtonStyles}
            onClick={isSignedIn ? handleLogout : login}
          >
            {isSignedIn ? "Sign Out" : "Sign In"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
