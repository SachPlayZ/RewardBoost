# Quest Rewards Contract Deployment Guide

This guide explains how to deploy the Quest Rewards Contract using the provided deployment scripts.

## Quick Start

### 1. Environment Setup

```bash
# Copy example environment file
cp example.env .env

# Edit .env with your actual values
nano .env
```

### 2. Deploy to Testnet (Recommended First)

```bash
# Deploy to Sepolia testnet
./script/deploy.sh sepolia

# Deploy to Mumbai testnet
./script/deploy.sh mumbai
```

### 3. Deploy to Mainnet

```bash
# Deploy to Ethereum mainnet with verification
./script/deploy.sh ethereum --verify

# Deploy to Polygon mainnet with verification
./script/deploy.sh polygon --verify
```

## Deployment Methods

### Method 1: Bash Script (Recommended)

The easiest way to deploy is using the provided bash script:

```bash
# Make script executable (if not already)
chmod +x script/deploy.sh

# Deploy to any supported network
./script/deploy.sh <network> [--verify]
```

**Supported Networks:**

- `ethereum` - Ethereum Mainnet
- `sepolia` - Ethereum Sepolia Testnet
- `polygon` - Polygon Mainnet
- `mumbai` - Polygon Mumbai Testnet
- `arbitrum` - Arbitrum One
- `sei` - SEI Network
- `localhost` - Local development

### Method 2: Direct Forge Commands

You can also use forge directly:

```bash
# Deploy main contract
forge script script/Deploy.s.sol:DeployQuestRewards \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY

# Deploy test tokens (for development)
forge script script/Deploy.s.sol:DeployTestTokens \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Deployer wallet
PRIVATE_KEY=your_private_key_without_0x_prefix
TREASURY_ADDRESS=0x...

# Network RPC URLs
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
# ... other networks

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key

# Custom token addresses (optional)
USDC_ADDRESS=0x...
SEI_ADDRESS=0x...
```

## Deployment Output

After successful deployment, you'll see:

```
=== Quest Rewards Contract Deployment ===
Network: Ethereum Sepolia
Deployer: 0x...
Treasury: 0x...
USDC Address: 0x...

QuestRewardsContract deployed at: 0x...
Added USDC as supported token

=== Deployment Summary ===
Contract Address: 0x...
Owner: 0x...
Treasury: 0x...
Guaranteed Reward Per User: 10000
Platform Fee Percentage: 2.5%
Minimum Reward Amount: 50000000
```

The deployment info is automatically saved to `deployments/<network>-deployment.json`.

## Network-Specific Token Addresses

The deployment script automatically uses the correct token addresses for each network:

### Ethereum Mainnet

- USDC: `0xA0B86a33e6e5e9EB02b6816E4D8F5C9A6c8A9A1B`

### Ethereum Sepolia Testnet

- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### Polygon Mainnet

- USDC: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

### Polygon Mumbai Testnet

- USDC: `0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747`

### Arbitrum One

- USDC: `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8`

### SEI Network

- Custom tokens via environment variables

## Post-Deployment Steps

1. **Verify Contract** (if not done automatically):

   ```bash
   forge verify-contract <CONTRACT_ADDRESS> QuestRewardsContract \
       --etherscan-api-key $ETHERSCAN_API_KEY \
       --constructor-args $(cast abi-encode "constructor(address)" $TREASURY_ADDRESS)
   ```

2. **Update Frontend Configuration**:

   - Add contract address to frontend config
   - Update ABI if needed

3. **Add Additional Supported Tokens** (if needed):

   ```bash
   cast send $CONTRACT_ADDRESS "addSupportedToken(address)" $TOKEN_ADDRESS \
       --private-key $PRIVATE_KEY \
       --rpc-url $RPC_URL
   ```

4. **Test Contract Functionality**:
   ```bash
   # Create a test campaign
   cast send $CONTRACT_ADDRESS "createCampaign(...)" \
       --private-key $PRIVATE_KEY \
       --rpc-url $RPC_URL
   ```

## Development & Testing

For local development:

```bash
# Start anvil local node
anvil

# Deploy to localhost
./script/deploy.sh localhost

# Deploy test tokens for development
forge script script/Deploy.s.sol:DeployTestTokens \
    --rpc-url http://localhost:8545 \
    --broadcast
```

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**: Make sure deployer wallet has enough ETH for gas
2. **"Nonce too high"**: Reset nonce or wait for pending transactions
3. **"Contract verification failed"**: Check API key and network settings
4. **"RPC URL not configured"**: Set correct RPC URL in .env file

### Gas Estimation

Approximate gas costs:

- Main contract deployment: ~3M gas
- Adding supported token: ~50K gas
- Creating campaign: ~200K gas

### Verify Deployment

Check deployment was successful:

```bash
# Check contract exists
cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL

# Check owner
cast call $CONTRACT_ADDRESS "owner()" --rpc-url $RPC_URL

# Check supported tokens
cast call $CONTRACT_ADDRESS "supportedTokens(address)" $USDC_ADDRESS --rpc-url $RPC_URL
```

## Security Considerations

- **Private Key Security**: Never commit private keys to version control
- **Treasury Address**: Use a secure multisig wallet for mainnet
- **Token Addresses**: Verify token addresses are correct for each network
- **Gas Limits**: Set appropriate gas limits for each network
- **Testing**: Always test on testnet before mainnet deployment

## Support

For deployment issues:

1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure sufficient balance for gas fees
4. Confirm network configuration matches your target chain
