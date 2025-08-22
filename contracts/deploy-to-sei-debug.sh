#!/bin/bash

# SEI Network Deployment Script (Debug Version)
# This script shows detailed error messages and has better debugging

set -e  # Exit on error but we'll handle it better

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load configuration from .env
source .env

# Configuration (with fallbacks)
SEI_RPC=${SEI_RPC:-"https://evm-rpc-testnet.sei-apis.com"}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Error handler function
handle_error() {
    local line=$1
    local command=$2
    print_error "Command failed at line $line: $command"
    print_error "Exit code: $?"
    exit 1
}

# Note: Error handling is done manually for each command

# Show current directory
print_info "Current directory: $(pwd)"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Please create .env file with:"
    echo "PRIVATE_KEY=your_private_key_without_0x_prefix"
    echo "TREASURY_ADDRESS=your_treasury_address (will be auto-set if deploying treasury first)"
    print_info "You can copy from: env.deployment.example"
    exit 1
fi

# Show .env file (without private key)
print_info "Environment file contents (private key hidden):"
if [ -f ".env" ]; then
    grep -v "PRIVATE_KEY" .env || echo "No .env content to show"
else
    print_warning ".env file not found, using defaults"
fi

# Source environment
print_info "Loading environment variables..."
if [ -f ".env" ]; then
    source .env
    print_success "Environment variables loaded from .env"
else
    print_warning "No .env file found, using environment variables or defaults"
fi

# Validate environment
if [ -z "$PRIVATE_KEY" ]; then
    print_error "PRIVATE_KEY not set in .env"
    print_info "Please add PRIVATE_KEY=0xyour_private_key_here to your .env file"
    exit 1
fi

# Ensure private key has 0x prefix
if [[ ! "$PRIVATE_KEY" =~ ^0x ]]; then
    PRIVATE_KEY="0x$PRIVATE_KEY"
    print_info "Added 0x prefix to private key"
fi

print_info "Private key length: ${#PRIVATE_KEY} characters"

# Set defaults for missing variables
TREASURY_ADDRESS=${TREASURY_ADDRESS:-""}  # Will be set during deployment
CHAIN_ID=${CHAIN_ID:-1329}
USDC_ADDRESS=${USDC_ADDRESS:-"0x3894085Ef7Ff0f0aeDf52E2A2704928d259f0C4C"}

print_info "Configuration:"
print_info "  SEI_RPC: $SEI_RPC"
print_info "  CHAIN_ID: $CHAIN_ID"
print_info "  USDC_ADDRESS: $USDC_ADDRESS"
if [ -n "$TREASURY_ADDRESS" ]; then
    print_info "  TREASURY_ADDRESS: $TREASURY_ADDRESS"
else
    print_info "  TREASURY_ADDRESS: (will be deployed automatically)"
fi
print_info "  Private Key: $(echo $PRIVATE_KEY | cut -c1-10)... (processed)"

print_header "SEI Network Deployment (Debug Mode)"

# Get deployer address
print_info "Getting deployer address..."
DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY 2>&1)
if [ $? -ne 0 ]; then
    print_error "Failed to get deployer address"
    echo "cast output: $DEPLOYER_ADDRESS"
    exit 1
fi
print_info "Deployer: $DEPLOYER_ADDRESS"

# Check balance
print_info "Checking SEI balance..."
BALANCE_OUTPUT=$(cast balance $DEPLOYER_ADDRESS --rpc-url $SEI_RPC 2>&1)
if [ $? -ne 0 ]; then
    print_error "Failed to check balance"
    echo "cast output: $BALANCE_OUTPUT"
    exit 1
fi

BALANCE=$(echo $BALANCE_OUTPUT | awk '{print $1}')
BALANCE_SEI=$(echo "scale=6; $BALANCE / 1000000000000000000" | bc 2>/dev/null || echo "0")
print_info "Raw balance: $BALANCE wei"
print_info "Balance: $BALANCE_SEI SEI"

if (( $(echo "$BALANCE_SEI < 0.1" | bc -l 2>/dev/null || echo "1") )); then
    print_warning "Low SEI balance! You need at least 0.1 SEI"
    print_info "Get SEI from faucet: https://faucet.sei-apis.com/"
    print_info "Current balance: $BALANCE_SEI SEI"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled by user"
        exit 0
    fi
fi

# Check if forge is available
print_info "Checking if forge is available..."
if ! command -v forge &> /dev/null; then
    print_error "forge command not found. Please install Foundry."
    print_info "Install from: https://getfoundry.sh/"
    exit 1
fi

print_info "Foundry version: $(forge --version)"

# Build contracts
print_info "Building contracts..."
BUILD_OUTPUT=$(forge build 2>&1)
if [ $? -ne 0 ]; then
    print_error "Build failed!"
    echo "Build output:"
    echo "$BUILD_OUTPUT"
    exit 1
fi

print_success "Build completed successfully"

# Deploy Treasury first
print_header "Deploying Treasury Contract"

print_info "Deploying treasury..."
print_info "Command: forge script script/DeployQuestRewards.sol:DeployTreasury --rpc-url $SEI_RPC --broadcast"

TREASURY_TX=$(forge script script/DeployQuestRewards.sol:DeployTreasury \
    --rpc-url $SEI_RPC \
    --broadcast 2>&1)

TREASURY_EXIT_CODE=$?

echo "Treasury deployment output:"
echo "$TREASURY_TX"

if [ $TREASURY_EXIT_CODE -ne 0 ]; then
    print_error "Treasury deployment failed with exit code $TREASURY_EXIT_CODE!"
    print_info "Common issues:"
    echo "1. Check your private key is correct (with or without 0x prefix)"
    echo "2. Ensure you have enough SEI (need ~0.01 SEI)"
    echo "3. Check if SEI RPC is accessible: curl -s $SEI_RPC"
    echo "4. Check if you have enough SEI for gas fees"
    echo "5. Verify your .env file has the correct PRIVATE_KEY value"
    exit 1
fi

# Extract treasury address from output
TREASURY_ADDRESS=$(echo "$TREASURY_TX" | grep "Treasury deployed at:" | awk '{print $4}' | tr -d '\n' || echo "")

if [ -z "$TREASURY_ADDRESS" ] || [ "$TREASURY_ADDRESS" = "0x0000000000000000000000000000000000000000" ]; then
    print_error "Could not extract treasury address from deployment output"
    print_info "Looking for 'Treasury deployed at:' in output..."
    echo "Full output was:"
    echo "$TREASURY_TX"
    exit 1
fi

print_success "Treasury deployed at: $TREASURY_ADDRESS"

# Update .env with treasury address
print_info "Updating .env file with treasury address..."
if grep -q "TREASURY_ADDRESS=" .env; then
    sed -i.bak "s/TREASURY_ADDRESS=.*/TREASURY_ADDRESS=$TREASURY_ADDRESS/" .env
else
    echo "TREASURY_ADDRESS=$TREASURY_ADDRESS" >> .env
fi
print_info "Updated .env with treasury address"

# Verify treasury deployment
print_info "Verifying treasury deployment..."
TREASURY_CODE=$(cast code $TREASURY_ADDRESS --rpc-url $SEI_RPC 2>&1)
if [ $? -ne 0 ]; then
    print_warning "Could not verify treasury code, but deployment may have succeeded"
    echo "Verification output: $TREASURY_CODE"
fi

# Deploy main contract
print_header "Deploying QuestRewardsContract"

print_info "Deploying main contract..."
print_info "Using treasury address: $TREASURY_ADDRESS"

MAIN_TX=$(forge script script/DeployQuestRewards.sol:DeployQuestRewards \
    --rpc-url $SEI_RPC \
    --broadcast 2>&1)

MAIN_EXIT_CODE=$?

echo "Main contract deployment output:"
echo "$MAIN_TX"

if [ $MAIN_EXIT_CODE -ne 0 ]; then
    print_error "Main contract deployment failed with exit code $MAIN_EXIT_CODE!"
    print_info "Common issues:"
    echo "1. Treasury deployment might have failed (check above)"
    echo "2. Check if you have enough SEI for gas fees"
    echo "3. Check if you still have enough SEI after treasury deployment"
    echo "4. Verify PRIVATE_KEY in .env file is correct"
    exit 1
fi

# Extract main contract address from output
MAIN_ADDRESS=$(echo "$MAIN_TX" | grep "QuestRewardsContract deployed at:" | awk '{print $4}' | tr -d '\n' || echo "")

if [ -z "$MAIN_ADDRESS" ] || [ "$MAIN_ADDRESS" = "0x0000000000000000000000000000000000000000" ]; then
    print_error "Could not extract main contract address from deployment output"
    print_info "Looking for 'QuestRewardsContract deployed at:' in output..."
    echo "Full output was:"
    echo "$MAIN_TX"
    exit 1
fi

print_success "QuestRewardsContract deployed at: $MAIN_ADDRESS"

# Save deployment info
print_header "Saving Deployment Information"

DEPLOYMENT_FILE="sei-deployment-$(date +%Y%m%d-%H%M%S).json"
cat > "$DEPLOYMENT_FILE" << EOF
{
  "network": "SEI Testnet",
  "chainId": $CHAIN_ID,
  "rpcUrl": "$SEI_RPC",
  "deployer": "$DEPLOYER_ADDRESS",
  "contracts": {
    "treasury": "$TREASURY_ADDRESS",
    "questRewards": "$MAIN_ADDRESS"
  },
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "explorerUrl": "https://seitrace.com",
  "environment": {
    "balanceBefore": "$BALANCE_SEI SEI",
    "usdcAddress": "$USDC_ADDRESS"
  }
}
EOF

print_success "Deployment info saved to $DEPLOYMENT_FILE"

# Print summary
print_header "Deployment Summary"
echo "Network: SEI Testnet"
echo "Chain ID: $CHAIN_ID"
echo "Explorer: https://seitrace.com"
echo ""
echo "Contracts:"
echo "  Treasury: $TREASURY_ADDRESS"
echo "  QuestRewardsContract: $MAIN_ADDRESS"
echo ""
echo "Deployment file: $DEPLOYMENT_FILE"
echo ""
echo "Frontend Configuration:"
echo "export const SEI_CONFIG = {"
echo "  chainId: $CHAIN_ID,"
echo "  rpcUrl: '$SEI_RPC',"
echo "  contracts: {"
echo "    treasury: '$TREASURY_ADDRESS',"
echo "    questRewards: '$MAIN_ADDRESS'"
echo "  },"
echo "  tokens: {"
echo "    usdc: '$USDC_ADDRESS',"
echo "    sei: '0x0000000000000000000000000000000000000000'"
echo "  }"
echo "};"

print_header "Verification Commands"
echo "# Check treasury owner:"
echo "cast call $TREASURY_ADDRESS \"owner()\" --rpc-url $SEI_RPC"
echo ""
echo "# Check main contract owner:"
echo "cast call $MAIN_ADDRESS \"owner()\" --rpc-url $SEI_RPC"
echo ""
echo "# Check treasury address in main contract:"
echo "cast call $MAIN_ADDRESS \"treasury()\" --rpc-url $SEI_RPC"
echo ""
echo "# Create test campaign (100 SEI reward, 3 winners):"
echo "cast send $MAIN_ADDRESS \"createCampaign(address,uint8,uint256,uint256,uint256,uint256,uint256)\" \\"
echo "  0x0000000000000000000000000000000000000000 \\"
echo "  1 \\"
echo "  \$(date +%s) \\"
echo "  \$((\$(date +%s) + 604800)) \\"
echo "  10 \\"
echo "  100000000 \\"
echo "  3 \\"
echo "  --private-key \$PRIVATE_KEY \\"
echo "  --rpc-url $SEI_RPC \\"
echo "  --value 102500000 \\"


print_success "SEI Deployment Complete! 🎉"
print_info "Check $DEPLOYMENT_FILE for all deployment details"
