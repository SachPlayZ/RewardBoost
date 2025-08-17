#!/bin/bash

# Quest Rewards Contract Deployment Script
# Usage: ./script/deploy.sh <network> [--verify]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if network is provided
if [ -z "$1" ]; then
    print_error "Network not specified!"
    echo "Usage: ./script/deploy.sh <network> [--verify]"
    echo "Available networks: ethereum, sepolia, polygon, mumbai, arbitrum, sei, localhost"
    exit 1
fi

NETWORK=$1
VERIFY_FLAG=""

# Check for verify flag
if [ "$2" = "--verify" ]; then
    VERIFY_FLAG="--verify"
    print_info "Contract verification enabled"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Source environment variables
source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    print_error "PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$TREASURY_ADDRESS" ]; then
    print_error "TREASURY_ADDRESS not set in .env file"
    exit 1
fi

print_info "Starting deployment to $NETWORK network..."

# Set RPC URL based on network
case $NETWORK in
    "ethereum")
        RPC_URL=${ETHEREUM_RPC_URL}
        ETHERSCAN_KEY=${ETHERSCAN_API_KEY}
        ;;
    "sepolia")
        RPC_URL=${SEPOLIA_RPC_URL}
        ETHERSCAN_KEY=${ETHERSCAN_API_KEY}
        ;;
    "polygon")
        RPC_URL=${POLYGON_RPC_URL}
        ETHERSCAN_KEY=${POLYGONSCAN_API_KEY}
        ;;
    "mumbai")
        RPC_URL=${MUMBAI_RPC_URL}
        ETHERSCAN_KEY=${POLYGONSCAN_API_KEY}
        ;;
    "arbitrum")
        RPC_URL=${ARBITRUM_RPC_URL}
        ETHERSCAN_KEY=${ARBISCAN_API_KEY}
        ;;
    "sei")
        RPC_URL=${SEI_RPC_URL}
        ;;
    "localhost")
        RPC_URL="http://localhost:8545"
        print_warning "Deploying to localhost. Make sure anvil is running."
        ;;
    *)
        print_error "Unknown network: $NETWORK"
        exit 1
        ;;
esac

if [ -z "$RPC_URL" ]; then
    print_error "RPC_URL not configured for network $NETWORK"
    exit 1
fi

print_info "Network: $NETWORK"
print_info "RPC URL: $RPC_URL"
print_info "Treasury: $TREASURY_ADDRESS"

# Build contracts
print_info "Building contracts..."
forge build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build completed"

# Deploy main contract
print_info "Deploying QuestRewardsContract..."

DEPLOY_CMD="forge script script/Deploy.s.sol:DeployQuestRewards \
    --rpc-url $RPC_URL \
    --broadcast \
    --gas-limit 3000000"

if [ -n "$VERIFY_FLAG" ] && [ -n "$ETHERSCAN_KEY" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --verify --etherscan-api-key $ETHERSCAN_KEY"
fi

eval $DEPLOY_CMD

if [ $? -ne 0 ]; then
    print_error "Deployment failed!"
    exit 1
fi

print_success "Deployment completed successfully!"

# Extract contract address from broadcast logs
BROADCAST_DIR="broadcast/Deploy.s.sol/$NETWORK"
if [ -d "$BROADCAST_DIR" ]; then
    LATEST_RUN=$(find $BROADCAST_DIR -name "run-latest.json" 2>/dev/null)
    if [ -f "$LATEST_RUN" ]; then
        CONTRACT_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "QuestRewardsContract") | .contractAddress' "$LATEST_RUN" 2>/dev/null)
        if [ -n "$CONTRACT_ADDRESS" ] && [ "$CONTRACT_ADDRESS" != "null" ]; then
            print_success "Contract deployed at: $CONTRACT_ADDRESS"
            
            # Save deployment info
            DEPLOYMENT_FILE="deployments/${NETWORK}-deployment.json"
            mkdir -p deployments
            
            cat > "$DEPLOYMENT_FILE" << EOF
{
  "network": "$NETWORK",
  "contractAddress": "$CONTRACT_ADDRESS",
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "treasury": "$TREASURY_ADDRESS",
  "deployer": "$(cast wallet address --private-key $PRIVATE_KEY)",
  "rpcUrl": "$RPC_URL"
}
EOF
            print_success "Deployment info saved to $DEPLOYMENT_FILE"
        fi
    fi
fi

print_info "Next steps:"
echo "1. Update frontend configuration with contract address"
echo "2. Fund treasury with initial tokens if needed"
echo "3. Test contract functionality"
echo "4. Monitor deployment on block explorer"

print_success "Deployment script completed!"
