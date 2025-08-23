// Token Contract Addresses for SEI Network

export const TOKEN_ADDRESSES = {
  // SEI Testnet Token Addresses
  TESTNET: {
    USDC: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED", // USDC address on SEI testnet
    SEI: "0x0000000000000000000000000000000000000000", // Native SEI token (zero address)
  },

  // SEI Mainnet Token Addresses  
  MAINNET: {
    USDC: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED", // USDC address on SEI mainnet 
    SEI: "0x0000000000000000000000000000000000000000", // Native SEI token
  }
} as const;

export const TOKEN_METADATA = {
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    icon: "🔵",
    color: "bg-blue-500",
  },
  SEI: {
    name: "SEI",
    symbol: "SEI",
    decimals: 18,
    icon: "🔴",
    color: "bg-red-500",
  },
} as const;

// Get token address based on current network
export function getTokenAddress(tokenSymbol: 'USDC' | 'SEI', isTestnet: boolean = true) {
  const network = isTestnet ? 'TESTNET' : 'MAINNET';
  const address = TOKEN_ADDRESSES[network][tokenSymbol];

  // Ensure we always return a valid address
  if (!address) {
    throw new Error(`Token address not found for ${tokenSymbol} on ${network}`);
  }

  return address;
}

// Token allowance and balance helper functions
export const TOKEN_CONSTANTS = {
  // Minimum amounts - Updated to match new contract requirements
  MIN_REWARD_AMOUNT: 1, // $1 minimum reward (contract now allows any amount > 0)
  MIN_CAMPAIGN_DEPOSIT: 1.05, // $1 reward + $0.05 platform fee (5%)
  
  // Maximum amounts
  MAX_REWARD_AMOUNT: 100000, // $100k maximum reward
  MAX_PARTICIPANTS: 10000,
  
  // Platform fees - 5% of reward amount
  PLATFORM_FEE_PERCENTAGE: 5, // 5% platform fee
  
  // XP Rewards
  XP_RATES: {
    FOLLOW_TASK: 10,
    POST_TASK: 50,
    CUSTOM_TASK: 25,
    VERIFIED_MULTIPLIER: 2,
    QUEST_COMPLETION_BONUS: 100,
  },
  
  // Streak System
  DAILY_STREAK_XP: 5, // 5 XP per day maintained
  STREAK_MILESTONE_DAYS: 5, // Every 5 days gets a raffle ticket
  MONTHLY_CAMPAIGN_THRESHOLD: 10, // 10 campaigns per month for raffle ticket
} as const;

// ERC20 Token ABI (minimal for our needs)
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
] as const;
