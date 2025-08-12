"use client";

import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { parseEther, isAddress, getAddress } from "viem";

export function SmartAccountDemo() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const {
    isLoading,
    smartAccount,
    smartAccountAddress,
    smartAccountClient,
    error,
    sendUserOperation,
    isReady,
  } = useSmartAccount();

  useEffect(() => {
    console.log("INSIDE USEFFECT");
    const testApiRoute = async () => {
      const userAddress = user?.wallet?.address;
      if (!authenticated || !userAddress) {
        return;
      }

      const testApiPayload = {
        inputToken: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", // Note: This is USDT0 on HyperEVM.
        userPublicAddress: userAddress,
        amount: 1,
      };

      console.log("Testing /api/lending with payload:", testApiPayload);

      try {
        const response = await fetch("/api/lending", {
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
        console.error(
          "A network or other error occurred during the API call:",
          error
        );
      }
    };

    testApiRoute();
  }, [user, authenticated]);

  const [txStatus, setTxStatus] = useState<{
    hash?: string;
    status: "idle" | "pending" | "success" | "error";
    error?: string;
  }>({ status: "idle" });

  const [recipient, setRecipient] = useState(
    "0xdcC0Eb74E3558a5667dBfA2f0E83B02A897ba772"
  );
  const [amount, setAmount] = useState("0.001");

  const handleSendTransaction = async () => {
    if (!smartAccountClient || !smartAccountAddress) {
      alert("Smart account not ready");
      return;
    }

    try {
      setTxStatus({ status: "pending" });

      const checksummedRecipient = getAddress(recipient);

      const txHash = await sendUserOperation(
        checksummedRecipient,
        parseEther(amount),
        "0x"
      );

      setTxStatus({
        status: "success",
        hash: txHash,
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxStatus({
        status: "error",
        error: error instanceof Error ? error.message : "Transaction failed",
      });
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Smart Account Demo</h2>
        <p className="mb-4 text-gray-600">
          Connect your wallet to start using account abstraction features.
        </p>
        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Smart Account Demo</h2>
        <button
          onClick={logout}
          className="bg-gray-500 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Account Information</h3>
        <p className="text-sm text-gray-600 mb-1">User ID: {user?.id}</p>
        <p className="text-sm text-gray-600 mb-1">
          Connected Wallet: {wallets[0]?.address || "No wallet connected"}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          Wallet Type: {wallets[0]?.walletClientType || "None"}
        </p>
        <p className="text-sm text-gray-600">
          Smart Account: {smartAccountAddress || "Not created yet"}
        </p>
      </div>

      {/* Smart Account Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Smart Account Status</h3>
        {isLoading && (
          <p className="text-blue-600">Creating smart account...</p>
        )}
        {error && (
          <div className="text-red-600">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
            {error.includes("wallet") && (
              <div className="mt-2 space-y-2">
                <div className="text-xs bg-yellow-50 p-2 rounded">
                  <p className="text-yellow-800">
                    💡 Tip: Your wallet is connected, but smart account creation
                    failed. Try the retry button below.
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Retry Smart Account Creation
                </button>
              </div>
            )}
          </div>
        )}
        {smartAccount && (
          <p className="text-green-600">✅ Smart account ready!</p>
        )}
        {!isReady && !isLoading && (
          <p className="text-yellow-600">Waiting for wallet connection...</p>
        )}
      </div>

      {/* Transaction Interface */}
      {smartAccount && (
        <div className="mb-6 p-4 border rounded">
          <h3 className="font-semibold mb-4">Burn 0 Hype (Gas Sponsored)</h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSendTransaction}
              disabled={txStatus.status === "pending"}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {txStatus.status === "pending"
                ? "Sending..."
                : "Send Transaction"}
            </button>
          </div>

          {/* Transaction Status */}
          {txStatus.status !== "idle" && (
            <div className="p-3 rounded text-sm">
              {txStatus.status === "pending" && (
                <p className="text-blue-600">Transaction pending...</p>
              )}
              {txStatus.status === "success" && (
                <div className="text-green-600">
                  <p>✅ Transaction successful!</p>
                  <p className="text-xs mt-1 break-all">
                    Hash: {txStatus.hash}
                  </p>
                  <p className="text-xs mt-1 break-all">
                    Blockchain Explorer:{" "}
                    <a
                      href={`https://hyperevmscan.io/tx/${txStatus.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      https://hyperevmscan.io/tx/{txStatus.hash}
                    </a>
                  </p>
                </div>
              )}
              {txStatus.status === "error" && (
                <p className="text-red-600">❌ {txStatus.error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
