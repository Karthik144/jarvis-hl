"use client";
import Navbar from "@/components/navbar";
import { Box, Typography } from "@mui/material";
import SessionSignerCard from "@/components/session-signer";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";

export default function Dashboard() {
  const { client } = useSmartWallets();
  const { user } = usePrivy();

  // Find the smart wallet from the user's linked accounts
  const embeddedWallet = user?.linkedAccounts.find(
    (account) => account.type === "wallet" && account.walletClientType === "privy" 
  );

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
      {embeddedWallet ? (
        <SessionSignerCard embedded_wallet={embeddedWallet as WalletWithMetadata} />
      ) : (
        <Typography variant="body1" color="error">
          No smart wallet found. Please connect or create a smart wallet.
        </Typography>
      )}
    </div>
  );
}