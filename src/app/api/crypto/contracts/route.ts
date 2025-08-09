import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { z } from 'zod';

const contractInteractionSchema = z.object({
  contractAddress: z.string(),
  abi: z.array(z.any()),
  method: z.string(),
  params: z.array(z.any()).optional().default([]),
  network: z.enum(['ethereum', 'polygon']).optional().default('ethereum'),
});

const contractReadSchema = z.object({
  contractAddress: z.string(),
  abi: z.array(z.any()),
  method: z.string(),
  params: z.array(z.any()).optional().default([]),
  network: z.enum(['ethereum', 'polygon']).optional().default('ethereum'),
});

// READ contract data (view functions)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const method = searchParams.get('method');
    const network = searchParams.get('network') || 'ethereum';
    
    if (!contractAddress || !method) {
      return NextResponse.json(
        { error: 'contractAddress and method are required' },
        { status: 400 }
      );
    }

    // Get RPC URL
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

    // For demonstration, using a simple ERC20 ABI
    // In production, you'd want to store ABIs in your database or fetch from a service
    const simpleERC20ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)"
    ];

    const contract = new ethers.Contract(contractAddress, simpleERC20ABI, provider);

    let result;
    try {
      result = await contract[method]();
    } catch (error) {
      return NextResponse.json(
        { error: `Method ${method} not found or failed to execute` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      contractAddress,
      method,
      result: result.toString(),
      network
    });

  } catch (error) {
    console.error('Contract read error:', error);
    return NextResponse.json(
      { error: 'Failed to read contract data' },
      { status: 500 }
    );
  }
}

// WRITE to contract (state-changing functions)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, abi, method, params, network } = contractInteractionSchema.parse(body);

    // Note: For write operations, you'd typically need the user's wallet to sign
    // This is usually done on the frontend using MetaMask or similar
    // Server-side signing should only be done for specific use cases with proper security

    if (!process.env.PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Server-side signing not configured. Use frontend wallet connection.' },
        { status: 501 }
      );
    }

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
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    // Estimate gas
    const gasEstimate = await contract[method].estimateGas(...params);
    
    // Execute transaction
    const tx = await contract[method](...params, {
      gasLimit: gasEstimate,
    });

    return NextResponse.json({
      transactionHash: tx.hash,
      contractAddress,
      method,
      params,
      network,
      gasUsed: gasEstimate.toString()
    });

  } catch (error) {
    console.error('Contract write error:', error);
    return NextResponse.json(
      { error: 'Failed to execute contract transaction' },
      { status: 500 }
    );
  }
}
