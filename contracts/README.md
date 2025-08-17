# Quest Rewards Contract

A comprehensive smart contract for managing Web3 quest campaigns with multiple reward distribution methods. This contract enables Web3 companies to launch campaigns and reward users with on-chain crypto for completing quests.

## Features

### 🎯 Three Reward Distribution Modes

1. **Lucky Draw**: Random selection of winners from participants
2. **Equal Distribution**: All participants receive equal rewards
3. **Performance-Based**: Rewards distributed based on quest completion scores

### 🔒 Security Features

- OpenZeppelin security contracts (ReentrancyGuard, Ownable, Pausable)
- Input validation and access controls
- Emergency pause functionality
- Checksum validation for addresses

### 📊 Campaign Management

- Draft → Active → Ended campaign lifecycle
- Configurable start/end times and participant limits
- Platform fee collection
- Campaign cancellation with refunds

### 🏆 Quest Tracking

- Participant registration and validation
- Quest score tracking for performance-based rewards
- Transparent reward distribution with events

## Contract Architecture

### Core Structs

```solidity
struct Campaign {
    uint256 campaignId;
    address creator;
    IERC20 rewardToken;
    RewardDistributionMethod distributionMethod;
    uint256 startTime;
    uint256 endTime;
    uint256 maxParticipants;
    CampaignStatus status;
    uint256 totalRewardAmount;
    uint256 platformFee;
    uint256 guaranteedRewardPerUser;
    uint256 depositRequired;
    uint256 numberOfWinners;
    uint256 totalParticipants;
    bool rewardsDistributed;
}

struct Participant {
    bool isParticipant;
    uint256 questScore;
    uint256 joinedAt;
    bool rewardClaimed;
}
```

### Key Functions

#### Campaign Management

- `createCampaign()`: Create a new quest campaign
- `activateCampaign()`: Deposit tokens and activate campaign
- `cancelCampaign()`: Cancel campaign and refund creator
- `endCampaignAndDistribute()`: End campaign and distribute rewards

#### Participation

- `joinCampaign()`: Join an active campaign
- `updateQuestScore()`: Update participant's quest completion score

#### Administration

- `addSupportedToken()`: Add supported reward tokens
- `pause()/unpause()`: Emergency pause functionality
- `emergencyWithdraw()`: Emergency token recovery

## Deployment

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install
```

### Compilation

```bash
forge build
```

### Testing

```bash
# Run all tests
forge test -v

# Run specific test
forge test --match-test testEqualDistribution -v

# Run tests with gas reporting
forge test --gas-report
```

### Deployment Script

```solidity
// script/Deploy.s.sol
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/QuestRewardsContract.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        QuestRewardsContract questContract = new QuestRewardsContract(treasury);

        // Add supported tokens
        questContract.addSupportedToken(0xA0B86a33e6e5e9EB02b6816E4D8F5C9A6c8A9A1B); // USDC

        vm.stopBroadcast();

        console.log("QuestRewardsContract deployed at:", address(questContract));
    }
}
```

## Usage Examples

### Creating a Campaign

```solidity
uint256 campaignId = questContract.createCampaign(
    usdcAddress,                                    // reward token
    RewardDistributionMethod.EqualDistribution,     // distribution method
    block.timestamp + 1 hours,                     // start time
    block.timestamp + 8 days,                      // end time
    100,                                           // max participants (0 = unlimited)
    1000 * 10**6,                                 // total reward (1000 USDC)
    0                                             // number of winners (not used for equal distribution)
);
```

### Activating a Campaign

```solidity
// Approve tokens for contract
rewardToken.approve(address(questContract), campaign.depositRequired);

// Activate campaign
questContract.activateCampaign(campaignId);
```

### Joining a Campaign

```solidity
questContract.joinCampaign(campaignId);
```

### Updating Quest Scores

```solidity
// Only contract owner can update scores
questContract.updateQuestScore(campaignId, participant, 85);
```

### Ending and Distributing Rewards

```solidity
// After campaign end time
questContract.endCampaignAndDistribute(campaignId);
```

## Events

The contract emits comprehensive events for off-chain indexing:

```solidity
event CampaignCreated(uint256 indexed campaignId, address indexed creator, ...);
event ParticipantJoined(uint256 indexed campaignId, address indexed participant, uint256 timestamp);
event QuestScoreUpdated(uint256 indexed campaignId, address indexed participant, uint256 newScore);
event RewardDistributed(uint256 indexed campaignId, address indexed recipient, uint256 amount, RewardDistributionMethod method);
event CampaignEnded(uint256 indexed campaignId, uint256 totalParticipants, uint256 totalRewardsDistributed);
event WinnersSelected(uint256 indexed campaignId, address[] winners);
```

## Security Considerations

### Access Control

- Only campaign creators can activate/cancel their campaigns
- Only contract owner can update quest scores
- Only contract owner can add supported tokens

### Input Validation

- Minimum reward amount enforced ($50 USDC)
- Campaign duration limits (max 365 days)
- Checksum validation for addresses
- Prevents double participation

### Economic Security

- Platform fees collected upfront
- Funds locked in contract until distribution
- Emergency pause functionality
- Refund mechanism for cancelled campaigns

### Randomness Note

⚠️ **Important**: The current lucky draw implementation uses `block.prevrandao` for randomness, which is predictable. For production use, integrate with [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction) for true randomness.

## Gas Optimization

- Compiler optimizations enabled (`via_ir: true`)
- Efficient data structures
- Batch operations where possible
- Gas-efficient random selection

## Supported Networks

The contract is designed to work on any EVM-compatible network. Update token addresses in the constructor for your target network:

- **Ethereum**: USDC `0xA0b86a33E6E5e9eb02b6816E4D8f5C9a6c8a9A1B`
- **Polygon**: USDC `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **Arbitrum**: USDC `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8`
- **SEI**: Update with SEI network token addresses

## Platform Integration

### Frontend Integration

```typescript
// Example Web3 integration
import { ethers } from "ethers";
import QuestRewardsABI from "./QuestRewards.json";

const contract = new ethers.Contract(contractAddress, QuestRewardsABI, signer);

// Create campaign
const tx = await contract.createCampaign(
  tokenAddress,
  distributionMethod,
  startTime,
  endTime,
  maxParticipants,
  totalRewardAmount,
  numberOfWinners
);

// Listen for events
contract.on("ParticipantJoined", (campaignId, participant, timestamp) => {
  console.log(`Participant ${participant} joined campaign ${campaignId}`);
});
```

### Backend Quest Validation

```typescript
// Example backend integration for quest validation
async function validateQuest(
  campaignId: number,
  participant: string,
  questData: any
) {
  // Validate quest completion off-chain
  const score = calculateQuestScore(questData);

  // Update on-chain score
  await contract.updateQuestScore(campaignId, participant, score);
}
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For questions and support, please create an issue in the repository or contact the development team.
