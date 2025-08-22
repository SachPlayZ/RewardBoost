#!/bin/bash

# Check Deployment Setup Script
# This script verifies that everything is set up correctly for SEI deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if we're in the right directory
if [ ! -f "src/QuestRewardsContract.sol" ]; then
    print_error "Not in contracts directory! Please run from the contracts/ directory"
    exit 1
fi

print_header "Deployment Setup Check"

# Check if .env exists
if [ -f ".env" ]; then
    print_success ".env file exists"
    source .env

    # Check private key
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env"
    else
        print_success "PRIVATE_KEY is set (${#PRIVATE_KEY} characters)"

        # Test private key
        DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
        if [ $? -eq 0 ]; then
            print_success "Private key is valid"
            print_info "Deployer address: $DEPLOYER"
        else
            print_error "Private key is invalid"
        fi
    fi

    # Check treasury address
    if [ -z "$TREASURY_ADDRESS" ]; then
        print_warning "TREASURY_ADDRESS not set (will be set automatically during deployment)"
    else
        print_success "TREASURY_ADDRESS is set: $TREASURY_ADDRESS"
    fi
else
    print_error ".env file not found"
    print_info "Copy from: cp env.deployment.example .env"
    print_info "Then edit .env with your private key"
fi

# Check if forge is installed
print_header "Checking Foundry Installation"
if command -v forge &> /dev/null; then
    FORGE_VERSION=$(forge --version)
    print_success "Foundry is installed: $FORGE_VERSION"
else
    print_error "Foundry is not installed"
    print_info "Install from: https://getfoundry.sh/"
    print_info "Run: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

# Check if cast is available
if command -v cast &> /dev/null; then
    print_success "cast is available"
else
    print_error "cast is not available"
    print_info "Install Foundry properly"
    exit 1
fi

# Check if contracts compile
print_header "Checking Contract Compilation"
if forge build &> /dev/null; then
    print_success "Contracts compile successfully"
else
    print_error "Contracts failed to compile"
    print_info "Run 'forge build' to see detailed errors"
    exit 1
fi

# Check deployment scripts
print_header "Checking Deployment Scripts"
if [ -f "script/DeployQuestRewards.sol" ]; then
    print_success "DeployQuestRewards.sol exists"
else
    print_error "DeployQuestRewards.sol not found"
fi

if [ -f "deploy-to-sei-debug.sh" ]; then
    print_success "deploy-to-sei-debug.sh exists"
    if [ -x "deploy-to-sei-debug.sh" ]; then
        print_success "deploy-to-sei-debug.sh is executable"
    else
        print_warning "deploy-to-sei-debug.sh is not executable"
        print_info "Run: chmod +x deploy-to-sei-debug.sh"
    fi
else
    print_error "deploy-to-sei-debug.sh not found"
fi

# Check SEI network connectivity
print_header "Checking SEI Network Connectivity"
SEI_RPC="https://evm-rpc-testnet.sei-apis.com"

print_info "Testing SEI RPC connection..."
if curl -s -X POST -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    $SEI_RPC > /dev/null 2>&1; then
    print_success "SEI RPC is accessible"

    # Get current block number
    BLOCK_NUM=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        $SEI_RPC | jq -r '.result' 2>/dev/null)
    if [ "$BLOCK_NUM" != "null" ] && [ -n "$BLOCK_NUM" ]; then
        BLOCK_DEC=$(printf "%d" $BLOCK_NUM)
        print_info "Current block number: $BLOCK_DEC"
    fi
else
    print_error "SEI RPC is not accessible"
    print_info "Check your internet connection"
    print_info "RPC URL: $SEI_RPC"
fi

# Check balance if we have a valid address
if [ -n "$DEPLOYER" ] && [ "$DEPLOYER" != "0x0000000000000000000000000000000000000000" ]; then
    print_header "Checking Deployer Balance"
    print_info "Getting balance for: $DEPLOYER"

    BALANCE=$(cast balance $DEPLOYER --rpc-url $SEI_RPC 2>/dev/null)
    if [ $? -eq 0 ]; then
        BALANCE_SEI=$(echo "scale=6; $BALANCE / 1000000000000000000" | bc 2>/dev/null || echo "0")
        print_info "Balance: $BALANCE_SEI SEI"

        if (( $(echo "$BALANCE_SEI < 0.1" | bc -l 2>/dev/null || echo "1") )); then
            print_warning "Low balance! You need at least 0.1 SEI for deployment"
            print_info "Get SEI from faucet: https://faucet.sei-apis.com/"
        else
            print_success "Sufficient balance for deployment"
        fi
    else
        print_error "Could not get balance"
        print_info "This might be due to network issues or invalid address"
    fi
fi

print_header "Setup Check Complete"

if [ -f ".env" ] && [ -n "$PRIVATE_KEY" ] && [ -n "$DEPLOYER" ]; then
    print_success "✅ Setup looks good for deployment!"
    print_info "You can now run: ./deploy-to-sei-debug.sh"
else
    print_error "❌ Setup incomplete. Please fix the issues above."
fi

print_info "For help, see: SEI_DEPLOYMENT_GUIDE.md"
