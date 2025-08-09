import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { z } from 'zod';

const walletSchema = z.object({
  address: z.string(),
  network: z.enum(['ethereum', 'polygon']).optional().default('ethereum'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network } = walletSchema.parse(body);

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Get RPC URL based on network
    const rpcUrl = network === 'polygon' 
      ? process.env.POLYGON_RPC_URL 
      : process.env.ETHEREUM_RPC_URL;

    if (!rpcUrl) {
      return NextResponse.json(
        { error: 'RPC URL not configured' },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Get wallet balance
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    // Get transaction count (nonce)
    const transactionCount = await provider.getTransactionCount(address);

    return NextResponse.json({
      address,
      network,
      balance: balanceInEth,
      transactionCount,
      isContract: await provider.getCode(address) !== '0x'
    });

  } catch (error) {
    console.error('Wallet info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const network = searchParams.get('network') || 'ethereum';

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const { address: validAddress, network: validNetwork } = walletSchema.parse({
      address,
      network
    });

    // Same logic as POST
    if (!ethers.isAddress(validAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const rpcUrl = validNetwork === 'polygon' 
      ? process.env.POLYGON_RPC_URL 
      : process.env.ETHEREUM_RPC_URL;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(validAddress);
    const balanceInEth = ethers.formatEther(balance);
    const transactionCount = await provider.getTransactionCount(validAddress);

    return NextResponse.json({
      address: validAddress,
      network: validNetwork,
      balance: balanceInEth,
      transactionCount,
      isContract: await provider.getCode(validAddress) !== '0x'
    });

  } catch (error) {
    console.error('Wallet info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    );
  }
}
