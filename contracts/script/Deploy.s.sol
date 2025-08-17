// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/QuestRewardsContract.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title DeployQuestRewards
 * @dev Deployment script for QuestRewardsContract
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployQuestRewards --rpc-url <RPC_URL> --broadcast --verify
 *
 * Environment variables needed:
 * - PRIVATE_KEY: Deployer private key
 * - TREASURY_ADDRESS: Platform treasury address
 * - USDC_ADDRESS: USDC token address for the target network
 * - SEI_ADDRESS: SEI token address (optional)
 */
contract DeployQuestRewards is Script {
    // Network-specific token addresses
    struct NetworkTokens {
        address usdc;
        address sei;
        string name;
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        // Get network-specific token addresses
        NetworkTokens memory tokens = getNetworkTokens();

        console.log("=== Quest Rewards Contract Deployment ===");
        console.log("Network:", tokens.name);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasury);
        console.log("USDC Address:", tokens.usdc);
        if (tokens.sei != address(0)) {
            console.log("SEI Address:", tokens.sei);
        }

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the main contract
        QuestRewardsContract questContract = new QuestRewardsContract(treasury);

        console.log(
            "QuestRewardsContract deployed at:",
            address(questContract)
        );

        // Add supported tokens
        if (tokens.usdc != address(0)) {
            questContract.addSupportedToken(tokens.usdc);
            console.log("Added USDC as supported token");
        }

        if (tokens.sei != address(0)) {
            questContract.addSupportedToken(tokens.sei);
            console.log("Added SEI as supported token");
        }

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Contract Address:", address(questContract));
        console.log("Owner:", questContract.owner());
        console.log("Treasury:", treasury);
        console.log(
            "Guaranteed Reward Per User:",
            questContract.guaranteedRewardPerUser()
        );
        console.log("Platform Fee Percentage: 2.5%");
        console.log(
            "Minimum Reward Amount:",
            questContract.MINIMUM_REWARD_AMOUNT()
        );

        vm.stopBroadcast();

        // Verification instructions
        console.log("\n=== Post-Deployment Instructions ===");
        console.log("1. Verify contract on block explorer");
        console.log(
            "2. Update frontend with contract address:",
            address(questContract)
        );
        console.log("3. Fund treasury with initial tokens if needed");
        console.log("4. Test contract functionality on testnet first");
    }

    /**
     * @dev Get network-specific token addresses based on chain ID
     */
    function getNetworkTokens() internal returns (NetworkTokens memory) {
        uint256 chainId = block.chainid;

        if (chainId == 1) {
            // Ethereum Mainnet
            return
                NetworkTokens({
                    usdc: 0xA0B86a33e6e5e9EB02b6816E4D8F5C9A6c8A9A1B,
                    sei: address(0),
                    name: "Ethereum Mainnet"
                });
        } else if (chainId == 11155111) {
            // Ethereum Sepolia Testnet
            return
                NetworkTokens({
                    usdc: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238, // Sepolia USDC
                    sei: address(0),
                    name: "Ethereum Sepolia"
                });
        } else if (chainId == 137) {
            // Polygon Mainnet
            return
                NetworkTokens({
                    usdc: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174,
                    sei: address(0),
                    name: "Polygon Mainnet"
                });
        } else if (chainId == 80001) {
            // Polygon Mumbai Testnet
            return
                NetworkTokens({
                    usdc: 0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747, // Mumbai USDC
                    sei: address(0),
                    name: "Polygon Mumbai"
                });
        } else if (chainId == 42161) {
            // Arbitrum One
            return
                NetworkTokens({
                    usdc: 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8,
                    sei: address(0),
                    name: "Arbitrum One"
                });
        } else if (chainId == 421613) {
            // Arbitrum Goerli Testnet
            return
                NetworkTokens({
                    usdc: 0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63, // Arbitrum Goerli USDC
                    sei: address(0),
                    name: "Arbitrum Goerli"
                });
        } else if (chainId == 1329) {
            // SEI Network (example chain ID - update with actual)
            return
                NetworkTokens({
                    usdc: vm.envOr("USDC_ADDRESS", address(0)),
                    sei: vm.envOr("SEI_ADDRESS", address(0)),
                    name: "SEI Network"
                });
        } else {
            // Unknown network - use environment variables
            console.log("Unknown network, using environment variables");
            return
                NetworkTokens({
                    usdc: vm.envOr("USDC_ADDRESS", address(0)),
                    sei: vm.envOr("SEI_ADDRESS", address(0)),
                    name: "Unknown Network"
                });
        }
    }
}

/**
 * @title DeployTestTokens
 * @dev Helper script to deploy test tokens for development/testing
 */
contract DeployTestTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("=== Deploying Test Tokens ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock USDC
        MockUSDC mockUSDC = new MockUSDC();
        console.log("Mock USDC deployed at:", address(mockUSDC));

        // Deploy mock SEI
        MockSEI mockSEI = new MockSEI();
        console.log("Mock SEI deployed at:", address(mockSEI));

        vm.stopBroadcast();

        console.log("\n=== Test Token Summary ===");
        console.log("Mock USDC:", address(mockUSDC));
        console.log("Mock SEI:", address(mockSEI));
        console.log("Initial supply: 1,000,000 tokens each");
    }
}

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "MUSDC") {
        _mint(msg.sender, 1000000 * 10 ** 6); // 1M USDC with 6 decimals
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * @title MockSEI
 * @dev Mock SEI token for testing
 */
contract MockSEI is ERC20 {
    constructor() ERC20("Mock SEI", "MSEI") {
        _mint(msg.sender, 1000000 * 10 ** 18); // 1M SEI with 18 decimals
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
