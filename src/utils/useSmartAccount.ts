"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { SmartAccountState } from "@/types";
import { TransactionCall } from "@/app/api/zap/types";

export function useSmartAccount() {
  const { user, ready, authenticated } = usePrivy();
  console.log("USER OBJECT IN USESMARTACCOUNT HOOK:", user);
  const smartWallet = user?.linkedAccounts?.find((account) => account.type === 'smart_wallet');

  const [state, setState] = useState<SmartAccountState>({
    smartWalletAddress: smartWallet?.address || null,
    smartWalletType: smartWallet?.type || null,
    lastVerified: smartWallet?.latestVerifiedAt || null,
    firstVerified: smartWallet?.firstVerifiedAt || null,
    error: null,
  });

  return {
    ...state,
    isReady: ready && authenticated && !state.error,
  };
}
