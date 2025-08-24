"use client";

import Navbar from "@/components/navbar";
import {
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import PrimaryButton from "@/components/primary-button";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import { useRouter } from "next/navigation";

export default function Preferences() {
  const [rebalanceFrequency, setRebalanceFrequency] = useState("weekly");
  const [rebalanceEnabled, setRebalanceEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = usePrivy();
  const router = useRouter();

  const smartWalletAddress = user?.smartWallet?.address || "";

  const handleRebalanceFrequencyChange = (
    event: React.MouseEvent<HTMLElement>,
    newFrequency: string | null
  ) => {
    if (newFrequency !== null) {
      setRebalanceFrequency(newFrequency);
    }
  };

  const handleRebalanceToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRebalanceEnabled(event.target.checked);
  };

  const handleCopy = () => {
    if (smartWalletAddress) {
      navigator.clipboard.writeText(smartWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    router.push("/creating");
  };

  return (
    <div>
      <Navbar />

      <main className="p-8">
        <Typography variant="h6" fontWeight={550}>
          Before I start creating your portfolio, please complete the
          following...
        </Typography>

        <div className="flex flex-col gap-4 mt-16 max-w-xl">
          <div className="flex items-center gap-2">
            <Typography variant="subtitle1">
              1. Enable auto-rebalance
            </Typography>
            <Switch
              checked={rebalanceEnabled}
              onChange={handleRebalanceToggle}
            />
          </div>
          {rebalanceEnabled && (
            <ToggleButtonGroup
              value={rebalanceFrequency}
              exclusive
              onChange={handleRebalanceFrequencyChange}
              aria-label="rebalance frequency"
            >
              <ToggleButton
                value="everyday"
                aria-label="everyday"
                sx={{ borderRadius: "12px", textTransform: "none", px: 3 }}
              >
                Everyday
              </ToggleButton>
              <ToggleButton
                value="weekly"
                aria-label="weekly"
                sx={{ borderRadius: "12px", textTransform: "none", px: 3 }}
              >
                Weekly
              </ToggleButton>
              <ToggleButton
                value="monthly"
                aria-label="monthly"
                sx={{ borderRadius: "12px", textTransform: "none", px: 3 }}
              >
                Monthly
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          {rebalanceEnabled && (
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="inherit" />}
            >
              Session keys act like a temporary, secure pass you approve,
              allowing us to automatically handle rebalancing on your behalf
              without needing your signature for every action. You control the
              duration, and the key automatically becomes invalid when the time
              expires.
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-16 max-w-xl">
          <Typography variant="subtitle1">
            2. Deposit funds to your smart account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To begin, send funds to the smart account address below. This
            address is unique to you.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              bgcolor: "grey.100",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.300",
              mt: 1,
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                mr: 2,
              }}
            >
              {smartWalletAddress || "Loading address..."}
            </Typography>
            <Tooltip
              title={copied ? "Copied!" : "Copy address"}
              placement="top"
            >
              <IconButton onClick={handleCopy} size="small">
                {copied ? (
                  <CheckIcon color="success" fontSize="small" />
                ) : (
                  <ContentCopyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          <div className="pt-12">
            <PrimaryButton
              onClick={handleContinue}
              endIcon={<EastRoundedIcon />}
            >
              Continue
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
