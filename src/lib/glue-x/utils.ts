import axios from "axios";

interface Reserve {
  chain: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: string;
  aTokenAddress: string;
}

interface MarketsResponse {
  reserves: Reserve[];
}

/**
 * Fetches the aTokenAddress for a given token on HyperEVM from the HyperLend API.
 * @param tokenAddress The address of the underlying asset (e.g., USDT0).
 * @returns The aTokenAddress for the token, or throws an error if not found.
 */
export async function getATokenAddress(tokenAddress: string): Promise<string> {
  const baseUrl = "https://api.hyperlend.finance";
  const chain = "hyperEvm";

  try {
    // Make GET request to /data/markets with chain=hyperEvm
    const response = await axios.get<MarketsResponse>(
      `${baseUrl}/data/markets`,
      {
        params: { chain },
      }
    );

    // Find the reserve matching the tokenAddress (case-insensitive)
    const reserve = response.data.reserves.find(
      (r) => r.underlyingAsset.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (!reserve) {
      throw new Error(
        `No reserve found for token ${tokenAddress} on chain ${chain}`
      );
    }

    if (!reserve.aTokenAddress) {
      throw new Error(
        `aTokenAddress not found for token ${tokenAddress} on chain ${chain}`
      );
    }

    console.log(
      `Found aTokenAddress for ${reserve.name} (${reserve.symbol}): ${reserve.aTokenAddress}`
    );
    return reserve.aTokenAddress;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "API request failed:",
        error.response?.data?.message || error.message
      );
    } else {
      console.error("Error fetching aTokenAddress:", error);
    }
    throw error;
  }
}

// Testing
// async function main() {
//   const USDT0_ADDRESS = "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb";
//   try {
//     const aTokenAddress = await getATokenAddress(USDT0_ADDRESS);
//     console.log(`aTokenAddress for USDT0: ${aTokenAddress}`);
//   } catch (error) {
//     console.error("Failed to fetch aTokenAddress:", error);
//   }
// }

// main().catch(console.error);
