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
  VAULT_ALLOCATION_FORMAT
} from "./constants";
import { usePortfolio } from "@/providers/PortfolioProvider";
import {AllocationType} from "@/constants";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useState, useEffect } from "react";
import { updateUserPortfolio } from "@/utils/updateUserPortfolio";
import { ethers } from "ethers";

export default function Allocation() {
  const { state: portfolio } = usePortfolio();
  const { user } = usePrivy();
  const { client } = useSmartWallets();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null); // USDT balance in formatted string (e.g., "5.0")

  // Constants
  const USDT_ADDRESS = "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb"; // USDT on HyperEVM
  const HYPEREVM_RPC_URL = process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  // Fetch USDT balance when user.smartWallet.address changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.smartWallet?.address) {
        setUsdtBalance(null);
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider(HYPEREVM_RPC_URL);
        const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
        const balance = await usdtContract.balanceOf(user.smartWallet.address);
        const decimals = await usdtContract.decimals();
        const formattedBalance = ethers.formatUnits(balance, decimals);
        setUsdtBalance(formattedBalance);
      } catch (error) {
        console.error("Error fetching USDT balance:", error);
        setError("Failed to fetch USDT balance.");
        setUsdtBalance(null);
      }
    };

    fetchBalance();
  }, [user?.smartWallet?.address]);

  const createPositions = async () => {
    if (!user?.smartWallet?.address || !client) {
      console.error(
        "Cannot create positions: User is not authenticated or smart wallet client is not available."
      );
      setError("Please connect your wallet to proceed.");
      return;
    }

    if (!usdtBalance || parseFloat(usdtBalance) <= 0) {
      setError(
        `Insufficient USDT balance in Smart Wallet (${user.smartWallet.address}). Please transfer usdt to your Smart Wallet.`
      );
      return;
    }

    const userAddress = user.smartWallet.address;
    const provider = new ethers.JsonRpcProvider(HYPEREVM_RPC_URL);
    const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);

    try {
      for (const allocation of portfolio) {
        // Skip non-lending allocations for testing
        if (allocation.category !== AllocationType.LENDING) {
          console.log(`Skipping non-lending allocation: ${allocation.category}`);
          continue;
        }

        const allocationAmount = 0.25 //Math.round((allocation.percentage / 100) * parseFloat(usdtBalance)); <-- UNCOMMENT AFTER TESTING
        if (allocationAmount <= 0) {
          console.log(`Skipping allocation with zero amount: ${allocation.category}`);
          continue;
        }

        // Convert amount to wei
        const decimals = await usdtContract.decimals();
        const amountInWei = ethers.parseUnits(allocationAmount.toString(), decimals);

        // Verify balance (redundant but ensures accuracy)
        const smartWalletBalance = await usdtContract.balanceOf(userAddress);
        if (smartWalletBalance < amountInWei) {
          setError(
            `Insufficient usdt in Smart Wallet (${userAddress}). Available: ${ethers.formatUnits(smartWalletBalance, decimals)} usdt, Required: ${allocationAmount} usdt.`
          );
          return;
        }

        const apiPayload = {
          inputToken: USDT_ADDRESS,
          userPublicAddress: userAddress,
          amount: allocationAmount,
          allocationType: allocation.category,
        };

        console.log("Sending API payload:", apiPayload);

        const response = await fetch("/api/zap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error("API call failed:", result);
          setError(`Failed to fetch transaction data for ${allocation.category}: ${result.error}`);
          return;
        }

        const transactions = result.transactions;

        console.log("Batching transactions:", transactions);

        // Send batched transactions using Privy Smart Wallet
        const txHash = await client.sendTransaction({
          calls: transactions.map((tx: { to: string; data: string; value: string }) => ({
            to: tx.to,
            data: tx.data,
            value: BigInt(tx.value),
          })),
        });

        console.log(`Transaction successful for ${allocation.category}! Tx Hash:`, txHash);
      }

      console.log("All positions created successfully!");
    } catch (error) {
      console.error("Error creating positions:", error);
      setError(error instanceof Error ? error.message : "An error occurred while creating positions.");
    }
  };

  const handleContinue = async () => {
    if (!user?.smartWallet?.address) {
      console.error(
        "Cannot save portfolio: User is not authenticated or has no smart account address."
      );
      setError("Please connect your wallet to proceed.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const userAddress = user.smartWallet.address;
      // const result = await updateUserPortfolio(userAddress, portfolio);
      let result = true; // --- IGNORE ---
      if (result) {
        console.log("Portfolio saved successfully!", result);
        await createPositions();
      } else {
        console.error("Failed to save portfolio.");
        setError("Failed to save portfolio.");
      }
    } catch (error) {
      console.error("Error in handleContinue:", error);
      setError(error instanceof Error ? error.message : "An error occurred while saving the portfolio.");
    } finally {
      setIsSaving(false);
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
            Start adding assets, LP pools, or lending markets you prefer for each allocation category.
          </Typography>
          {/* Display Smart Wallet usdt balance */}
          <Typography variant="subtitle1" color="primary" className="pt-4">
            Total Portfolio Amount: <b>{usdtBalance ? `${parseFloat(usdtBalance).toFixed(2)} USDT` : "Loading..."}</b>
          </Typography>
          {error && (
            <Typography variant="body2" color="error" className="pt-4">
              {error}
            </Typography>
          )}
        </div>
        <div className="flex flex-col gap-4 max-w-[40rem] pt-12">
          <div className="flex flex-row gap-12">
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
          <div className="flex flex-row gap-12">
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
              disabled={isSaving || !usdtBalance}
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