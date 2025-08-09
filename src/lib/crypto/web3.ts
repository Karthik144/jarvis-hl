import { ethers } from 'ethers';

export type SupportedNetwork = 'ethereum' | 'polygon';

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer: string;
}

export const NETWORKS: Record<SupportedNetwork, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
    chainId: 1,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://etherscan.io',
  },
  polygon: {
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    chainId: 137,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorer: 'https://polygonscan.com',
  },
};

export class Web3Service {
  private static providers: Map<SupportedNetwork, ethers.JsonRpcProvider> = new Map();

  static getProvider(network: SupportedNetwork): ethers.JsonRpcProvider {
    if (!this.providers.has(network)) {
      const config = NETWORKS[network];
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      this.providers.set(network, provider);
    }
    
    return this.providers.get(network)!;
  }

  static async getBalance(address: string, network: SupportedNetwork = 'ethereum'): Promise<string> {
    const provider = this.getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  static async getTransactionCount(address: string, network: SupportedNetwork = 'ethereum'): Promise<number> {
    const provider = this.getProvider(network);
    return await provider.getTransactionCount(address);
  }

  static async isContract(address: string, network: SupportedNetwork = 'ethereum'): Promise<boolean> {
    const provider = this.getProvider(network);
    const code = await provider.getCode(address);
    return code !== '0x';
  }

  static async getTransaction(txHash: string, network: SupportedNetwork = 'ethereum') {
    const provider = this.getProvider(network);
    return await provider.getTransaction(txHash);
  }

  static async getTransactionReceipt(txHash: string, network: SupportedNetwork = 'ethereum') {
    const provider = this.getProvider(network);
    return await provider.getTransactionReceipt(txHash);
  }

  static validateAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  static async estimateGas(
    to: string,
    data: string,
    value: string = '0',
    network: SupportedNetwork = 'ethereum'
  ): Promise<bigint> {
    const provider = this.getProvider(network);
    return await provider.estimateGas({
      to,
      data,
      value: ethers.parseEther(value),
    });
  }
}

export class ContractService {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;

  constructor(
    contractAddress: string,
    abi: any[],
    network: SupportedNetwork = 'ethereum',
    signerPrivateKey?: string
  ) {
    this.provider = Web3Service.getProvider(network);
    
    if (signerPrivateKey) {
      const wallet = new ethers.Wallet(signerPrivateKey, this.provider);
      this.contract = new ethers.Contract(contractAddress, abi, wallet);
    } else {
      this.contract = new ethers.Contract(contractAddress, abi, this.provider);
    }
  }

  async read(methodName: string, ...args: any[]): Promise<any> {
    return await this.contract[methodName](...args);
  }

  async write(methodName: string, ...args: any[]): Promise<ethers.ContractTransaction> {
    return await this.contract[methodName](...args);
  }

  async estimateGas(methodName: string, ...args: any[]): Promise<bigint> {
    return await this.contract[methodName].estimateGas(...args);
  }

  getAddress(): string {
    return this.contract.target as string;
  }
}

// Common ERC-20 token operations
export class TokenService extends ContractService {
  constructor(
    tokenAddress: string,
    network: SupportedNetwork = 'ethereum',
    signerPrivateKey?: string
  ) {
    const erc20ABI = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function transferFrom(address from, address to, uint256 amount) returns (bool)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)'
    ];

    super(tokenAddress, erc20ABI, network, signerPrivateKey);
  }

  async getTokenInfo() {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.read('name'),
      this.read('symbol'),
      this.read('decimals'),
      this.read('totalSupply')
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
      address: this.getAddress()
    };
  }

  async getBalance(walletAddress: string): Promise<string> {
    const balance = await this.read('balanceOf', walletAddress);
    return balance.toString();
  }

  async transfer(to: string, amount: string): Promise<ethers.ContractTransaction> {
    return await this.write('transfer', to, ethers.parseUnits(amount, await this.read('decimals')));
  }
}
