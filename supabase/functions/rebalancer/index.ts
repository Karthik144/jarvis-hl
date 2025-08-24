// Supabase Edge Function: rebalance.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

interface PriceData {
  price_usd: string;
  symbol: string;
  address: string;
}

interface TokenData {
  price_usd: string;
  symbol: string;
  address: string;
}

interface AllocationItem {
  category: string;
  percentage: number;
  allocations: string[];
}

interface UserForRebalance {
  id: string;
  userPublicAddress: string;
  portfolio: AllocationItem[];
  initial_asset_prices: { token_address: string; initial_price: number }[];
  total_deposit_amount?: { amount: number };
}

const NETWORK = "hyperevm";
const REBALANCE_THRESHOLD = 0.1; // 10% threshold
const GECKOTERMINAL_BASE_URL = Deno.env.get("GECKOTERMINAL_BASE_URL") || "https://api.geckoterminal.com/api/v2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to fetch current token price from GeckoTerminal
async function getCurrentTokenPrice(tokenAddress: string): Promise<TokenData | null> {
  if (!tokenAddress) {
    console.error("Error: Token address is required.");
    return null;
  }

  const url = `${GECKOTERMINAL_BASE_URL}/networks/${NETWORK}/tokens/${tokenAddress}`;

  try {
    console.log(`Fetching data for ${tokenAddress} from GeckoTerminal...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const attributes = data.data.attributes;
    const priceUsd = attributes.price_usd;
    const symbol = attributes.symbol;
    const address = attributes.address;

    if (!priceUsd || !symbol || !address) {
      console.error(`Error: Incomplete data received for token ${tokenAddress}.`);
      return null;
    }

    return {
      price_usd: priceUsd,
      symbol: symbol,
      address: address,
    };
  } catch (error) {
    console.error(`Error fetching data for ${tokenAddress}:`, error);
    return null;
  }
}

// Function to fetch all users from Supabase
async function getAllUsers(): Promise<UserForRebalance[]> {
  console.log("Fetching all users from the database...");
  const { data, error } = await supabase
    .from("users")
    .select("id, userPublicAddress, portfolio, initial_asset_prices, total_deposit_amount")
    .not("portfolio", "is", null);

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  console.log(`Found ${data.length} users with portfolios.`);
  return data as UserForRebalance[];
}

// Function to process rebalancing for a single user
function processUserRebalance(
  user: UserForRebalance,
  currentPriceMap: Map<string, PriceData>
): { userAddress: string; rebalanceNeeded: boolean; details: any[] } {
  console.log(`\n--- Analyzing user: ${user.userPublicAddress} ---`);

  const spotAllocation = user.portfolio.find((p: AllocationItem) => p.category === "spot");

  if (!spotAllocation || spotAllocation.allocations.length === 0) {
    console.log("User has no assets in their spot allocation. Skipping.");
    return { userAddress: user.userPublicAddress, rebalanceNeeded: false, details: [] };
  }

  const totalDeposit = user.total_deposit_amount?.amount;
  if (!totalDeposit) {
    console.log("User has no total deposit amount. Skipping.");
    return { userAddress: user.userPublicAddress, rebalanceNeeded: false, details: [] };
  }

  const spotPercentage = spotAllocation.percentage / 100;
  const initialSpotValue = totalDeposit * spotPercentage;
  const numSpotAssets = spotAllocation.allocations.length;
  const initialValuePerAsset = initialSpotValue / numSpotAssets;

  // Create a mapping from token address to initial price
  const initialPricesMap = new Map(
    user.initial_asset_prices.map((p) => [p.token_address, p.initial_price])
  );

  let totalCurrentSpotValue = 0;

  const assetDetails = spotAllocation.allocations
    .map((tokenAddress: string) => {
      const initialPrice = initialPricesMap.get(tokenAddress);
      const currentPriceData = currentPriceMap.get(tokenAddress);

      if (!initialPrice || !currentPriceData) {
        console.warn(`Missing price data for ${tokenAddress}. Cannot process this asset.`);
        return null;
      }

      const initialQuantity = initialValuePerAsset / initialPrice;
      const currentValue = initialQuantity * parseFloat(currentPriceData.price_usd);
      totalCurrentSpotValue += currentValue;

      return {
        tokenAddress,
        symbol: currentPriceData.symbol,
        currentValue,
      };
    })
    .filter(Boolean);

  if (assetDetails.length === 0) {
    console.log("Could not process any assets for this user due to missing data.");
    return { userAddress: user.userPublicAddress, rebalanceNeeded: false, details: [] };
  }

  const targetValuePerAsset = totalCurrentSpotValue / assetDetails.length;
  const rebalanceHighThreshold = targetValuePerAsset * (1 + REBALANCE_THRESHOLD);

  console.log(`Initial Spot Value: $${initialSpotValue.toFixed(2)}`);
  console.log(`Total Current Spot Value: $${totalCurrentSpotValue.toFixed(2)}`);
  console.log(
    `Target Value Per Asset: $${targetValuePerAsset.toFixed(2)} (Threshold: > $${rebalanceHighThreshold.toFixed(2)})`
  );

  let rebalanceNeeded = false;
  const details = assetDetails.map((asset) => {
    if (asset && asset.currentValue > rebalanceHighThreshold) {
      console.log(
        `REBALANCE NEEDED for ${asset.symbol} (${asset.tokenAddress.slice(0, 8)}...). Current Value: $${asset.currentValue.toFixed(2)}`
      );
      rebalanceNeeded = true;
      return {
        tokenAddress: asset.tokenAddress,
        symbol: asset.symbol,
        currentValue: asset.currentValue.toFixed(2),
        status: "Rebalance Needed",
      };
    } else if (asset) {
      console.log(
        `${asset.symbol} is within allocation. Current Value: $${asset.currentValue.toFixed(2)}`
      );
      return {
        tokenAddress: asset.tokenAddress,
        symbol: asset.symbol,
        currentValue: asset.currentValue.toFixed(2),
        status: "Balanced",
      };
    }
    return null;
  }).filter(Boolean);

  if (!rebalanceNeeded) {
    console.log("Portfolio is balanced.");
  }

  return { userAddress: user.userPublicAddress, rebalanceNeeded, details };
}

// HTTP handler for Supabase Edge Function
serve(async (req: Request) => {
  try {
    // Only allow POST requests (optional, adjust as needed)
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Starting rebalancing process...");

    // Fetch all users
    const users = await getAllUsers();

    if (users.length === 0) {
      console.log("No users to process.");
      return new Response(JSON.stringify({ message: "No users to process", usersProcessed: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Collect unique token addresses
    const allTokenAddresses = new Set<string>();
    users.forEach((user) => {
      const spotAllocation = user.portfolio.find((p) => p.category === "spot");
      spotAllocation?.allocations.forEach((address) => allTokenAddresses.add(address));
    });

    console.log(`Fetching prices for ${allTokenAddresses.size} unique tokens...`);

    // Fetch token prices
    const pricePromises = Array.from(allTokenAddresses).map(getCurrentTokenPrice);
    const priceResults = await Promise.all(pricePromises);

    const priceMap = new Map<string, PriceData>();
    priceResults.forEach((result) => {
      if (result) {
        priceMap.set(result.address, result);
      }
    });

    console.log(`Successfully fetched prices for ${priceMap.size} tokens.`);

    // Process rebalancing for each user
    const results = users.map((user) => processUserRebalance(user, priceMap));

    // Summarize results
    const summary = {
      usersProcessed: users.length,
      usersNeedingRebalance: results.filter((r) => r.rebalanceNeeded).length,
      details: results,
    };

    return new Response(JSON.stringify({ success: true, ...summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in rebalance function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});