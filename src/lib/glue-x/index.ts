import { ethers } from "ethers";
import { getATokenAddress } from "./utils";
const API_KEY = "test";
const QUOTE_ENDPOINT = "https://router.gluex.xyz/v1/quote";
const RPC_URL = "https://base.gateway.tenderly.co/3GZoRDtZ3kGFaM0FJcGvPB";
const PRIVATE_KEY = "test";

// This is a test with aave on Base
const TOKEN_A = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
const TOKEN_B = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"; // aUSDC on Base (Aave's yield-bearing USDC token)
const INPUT_AMOUNT = BigInt("2000000");

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const COMPUTATION_UNITS = 1000000;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

async function fetchQuote() {
  // Fetch a quote from the GlueX Router for $TOKEN_A to $TOKEN_B swap
  const headers = { "x-api-key": API_KEY };
  const body = {
    chainID: "base",
    userAddress: wallet.address,
    outputReceiver: wallet.address,
    uniquePID: "test",
    inputToken: TOKEN_A,
    outputToken: TOKEN_B,
    inputAmount: INPUT_AMOUNT.toString(),
    isPermit2: false,
  };

  console.log("Fetching quote with body:", body);

  const response = await fetch(QUOTE_ENDPOINT, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log("Response json:", data);
  return data;
}

async function approveSpender(
  spender: string,
  amount: bigint,
  tokenAddress: string
) {
  // Approve the router contract to spend $TOKEN_A
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const populateTx = await tokenContract.approve.populateTransaction(
    spender,
    amount
  );

  const feeData = await provider.getFeeData();
  const nonce = await provider.getTransactionCount(wallet.address);

  const tx = await wallet.sendTransaction({
    ...populateTx,
    gasLimit: COMPUTATION_UNITS,
    maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    nonce,
  });

  console.log(`Approval Transaction Hash: ${tx.hash}`);

  return tx.hash;
}

async function executeTransaction(calldata: string, routerAddress: string) {
  // Execute the swap transaction on GlueX Router
  const feeData = await provider.getFeeData();
  const nonce = await provider.getTransactionCount(wallet.address);

  // To-Do: Extract the calldata and use it for the bundler
  const tx = await wallet.sendTransaction({
    to: routerAddress,
    data: calldata,
    gasLimit: COMPUTATION_UNITS,
    maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    nonce,
  });

  console.log(`Transaction Hash: ${tx.hash}`);

  return tx.hash;
}

async function main() {
  const quoteData = await fetchQuote();
  if (quoteData.statusCode !== 200) {
    console.log("Error fetching quote:", quoteData);
    return;
  }

  console.log("Quote received successfully:", quoteData);
  const routerAddress = quoteData.result.router;
  const calldata = quoteData.result.calldata;

  console.log("Approving router contract to spend TOKEN_A...");
  await approveSpender(routerAddress, INPUT_AMOUNT, TOKEN_A);

  console.log("Executing transaction...");
  const executeHash = await executeTransaction(calldata, routerAddress);

  const receipt = await provider.waitForTransaction(executeHash);
  console.log("Transaction confirmed. Receipt:");
  console.log(receipt);
}

main().catch(console.error);
