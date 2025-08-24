// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/QuestRewardsContract.sol";

/**
 * @title DeployQuestRewards
 * @dev Deployment script for QuestRewardsContract on SEI with internal vault
 *
 * Usage:
 * forge script script/DeployQuestRewards.sol:DeployQuestRewards --rpc-url <SEI_RPC_URL> --broadcast --verify
 *
 * Environment variables needed:
 * - PRIVATE_KEY: Deployer private key
 */
contract DeployQuestRewards is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the main contract with internal vault
        QuestRewardsContract questContract = new QuestRewardsContract();

        console.log(
            "QuestRewardsContract deployed at:",
            address(questContract)
        );
        console.log("Owner:", questContract.owner());
        console.log("USDC Address:", questContract.USDC_ADDRESS());

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("Contract Address:", address(questContract));
        console.log("Network: SEI");
        console.log("Chain ID:", block.chainid);
        console.log("\nFeatures:");
        console.log("- Internal platform fee vault");
        console.log("- Owner can withdraw platform fees anytime");
        console.log("\nNext Steps:");
        console.log(
            "1. Update frontend with contract address:",
            address(questContract)
        );
        console.log("2. Platform fees automatically stored in internal vault");
        console.log("3. Use withdrawPlatformFees() to extract fees");
        console.log("4. Test contract functionality");
    }
}
