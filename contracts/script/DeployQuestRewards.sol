// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/QuestRewardsContract.sol";
import "../src/Treasury.sol";

/**
 * @title DeployQuestRewards
 * @dev Deployment script for QuestRewardsContract on SEI
 *
 * Usage:
 * forge script script/DeployQuestRewards.sol:DeployQuestRewards --rpc-url <SEI_RPC_URL> --broadcast --verify
 *
 * Environment variables needed:
 * - PRIVATE_KEY: Deployer private key
 * - TREASURY_ADDRESS: Platform treasury address
 */
contract DeployQuestRewards is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", address(0));

        vm.startBroadcast(deployerPrivateKey);

        // If treasury address is not set, deploy treasury first
        if (treasury == address(0)) {
            console.log(
                "Treasury address not provided, deploying treasury first..."
            );
            address emergencyRecipient = vm.envOr(
                "EMERGENCY_RECIPIENT",
                vm.addr(deployerPrivateKey)
            );
            Treasury newTreasury = new Treasury(emergencyRecipient);
            treasury = address(newTreasury);
            console.log("Treasury deployed at:", treasury);
        }

        // Deploy the main contract
        QuestRewardsContract questContract = new QuestRewardsContract(treasury);

        console.log(
            "QuestRewardsContract deployed at:",
            address(questContract)
        );
        console.log("Owner:", questContract.owner());
        console.log("Treasury:", questContract.treasury());
        console.log("USDC Address:", questContract.USDC_ADDRESS());

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("Contract Address:", address(questContract));
        console.log("Network: SEI");
        console.log("Chain ID:", block.chainid);
        console.log("\nNext Steps:");
        console.log(
            "1. Update frontend with contract address:",
            address(questContract)
        );
        console.log("2. Fund treasury with SEI/USDC for platform fees");
        console.log("3. Test contract functionality");
    }
}

/**
 * @title DeployTreasury
 * @dev Deployment script for Treasury contract
 */
contract DeployTreasury is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address emergencyRecipient = vm.envOr(
            "EMERGENCY_RECIPIENT",
            vm.addr(deployerPrivateKey)
        );

        vm.startBroadcast(deployerPrivateKey);

        // Deploy treasury
        Treasury treasury = new Treasury(emergencyRecipient);

        console.log("Treasury deployed at:", address(treasury));
        console.log("Owner:", treasury.owner());
        console.log("Emergency Recipient:", treasury.emergencyRecipient());

        vm.stopBroadcast();

        console.log("\n=== Treasury Deployment Summary ===");
        console.log("Treasury Address:", address(treasury));
        console.log("Emergency Recipient:", emergencyRecipient);
    }
}
