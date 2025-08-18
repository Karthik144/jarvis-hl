"use client";

import AllocationSummaryBox from "@/components/allocation-summary-box";
import Navbar from "@/components/navbar";
import { Typography } from "@mui/material";
import PrimaryButton from "@/components/primary-button";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import {
  LENDING_ALLOCATION_FORMAT,
  LP_ALLOCATION_FORMAT,
  SPOT_ALLOCATION_FORMAT,
  VAULT_ALLOCATION_FORMAT,
} from "./constants";
import { usePortfolio } from "@/providers/PortfolioProvider";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { updateUserPortfolio } from "@/utils/updateUserPortfolio";
import { AllocationType } from "@/constants";

export default function Allocation() {
  const { state: portfolio } = usePortfolio();
  const { user } = usePrivy();
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    // if (!user?.wallet?.address) {
    //   console.error(
    //     "Cannot save portfolio: User is not authenticated or has no wallet address."
    //   );
    //   return;
    // }

    setIsSaving(true);

    // To-Do: Change this to privy user address
    // Just for testing rn
    const userAddress = "0x02B64a79Aa2f080C755B9F6AFd654BeB67f548F3";
    const result = await updateUserPortfolio(userAddress, portfolio);
    await createPositions();

    setIsSaving(false);

    if (result) {
      console.log("Portfolio saved successfully!", result);
    } else {
      console.error("Failed to save portfolio.");
    }
  };

  const createPositions = async () => {
    // To-Do: Change this to privy user address
    // Just for testing rn
    const userAddress = "0x02B64a79Aa2f080C755B9F6AFd654BeB67f548F3";
    // Note: If you're making any other call other than a lending allocation, then you need to pass in the output token
    // We don't need output token for lending allocation since we get it from HyperLend API.
    // Output token, if included, should be called requestedOutputToken
    // For creating a vault allocation, you just need to include the output token address as the yield bearing asset
    const testApiPayload = {
      inputToken: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", // Note: This is USDT0 on HyperEVM.
      userPublicAddress: userAddress,
      amount: 1,
      allocationType: AllocationType.LENDING,
    };

    try {
      const response = await fetch("/api/zap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testApiPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("API call failed:", result);
      } else {
        console.log(
          "API call successful! Received transactions for bundler:",
          result.transactions
        );
      }
    } catch (error) {
      console.error("Error creating positions:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="p-8">
        <div className="flex flex-col gap-1">
          <Typography variant="h6" fontWeight={550}>
            Here’s the portfolio I designed for you...
          </Typography>
          <Typography variant="body1">
            Start adding assets, LP pools, or lending markets you prefer for
            each allocation category.
          </Typography>
        </div>
        <div className="flex flex-col gap-4 max-w-[40rem] pt-12">
          <div className="flex flex-row gap-12 ">
            <AllocationSummaryBox
              format={SPOT_ALLOCATION_FORMAT}
              allocation={portfolio[0]}
            />
            <AllocationSummaryBox
              format={VAULT_ALLOCATION_FORMAT}
              allocation={portfolio[1]}
              hasButton={false}
            />
          </div>
          <div className="flex flex-row gap-12 ">
            <AllocationSummaryBox
              format={LENDING_ALLOCATION_FORMAT}
              allocation={portfolio[2]}
            />
            <AllocationSummaryBox
              format={LP_ALLOCATION_FORMAT}
              allocation={portfolio[3]}
            />
          </div>

          <div className="pt-12">
            <PrimaryButton
              onClick={handleContinue}
              disabled={isSaving}
              endIcon={<EastRoundedIcon />}
            >
              {isSaving ? "Saving..." : "Continue"}
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
