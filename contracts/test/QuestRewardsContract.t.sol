// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/QuestRewardsContract.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock USDC", "MUSDC") {
        _mint(msg.sender, 1000000 * 10 ** 6); // 1M tokens with 6 decimals
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract QuestRewardsContractTest is Test {
    QuestRewardsContract public questContract;
    MockERC20 public mockToken;

    address public treasury = makeAddr("treasury");
    address public creator = makeAddr("creator");
    address public participant1 = makeAddr("participant1");
    address public participant2 = makeAddr("participant2");
    address public participant3 = makeAddr("participant3");

    uint256 public constant REWARD_AMOUNT = 100 * 10 ** 6; // $100 in USDC

    function setUp() public {
        questContract = new QuestRewardsContract(treasury);
        mockToken = new MockERC20();

        // Add mock token as supported
        questContract.addSupportedToken(address(mockToken));

        // Transfer tokens to creator for testing
        mockToken.transfer(creator, 500000 * 10 ** 6);
    }

    function testCreateCampaign() public {
        vm.startPrank(creator);

        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            100, // max participants
            REWARD_AMOUNT,
            0 // not used for equal distribution
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);

        assertEq(campaign.campaignId, campaignId);
        assertEq(campaign.creator, creator);
        assertEq(address(campaign.rewardToken), address(mockToken));
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Draft)
        );
        assertEq(campaign.totalRewardAmount, REWARD_AMOUNT);

        vm.stopPrank();
    }

    function testActivateCampaign() public {
        vm.startPrank(creator);

        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            100,
            REWARD_AMOUNT,
            0
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        uint256 requiredDeposit = campaign.depositRequired;

        // Approve tokens for contract
        mockToken.approve(address(questContract), requiredDeposit);

        // Activate campaign
        questContract.activateCampaign(campaignId);

        campaign = questContract.getCampaign(campaignId);
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Active)
        );

        vm.stopPrank();
    }

    function testJoinCampaign() public {
        // Create and activate campaign
        vm.startPrank(creator);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            100,
            REWARD_AMOUNT,
            0
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        mockToken.approve(address(questContract), campaign.depositRequired);
        questContract.activateCampaign(campaignId);
        vm.stopPrank();

        // Fast forward to campaign start
        vm.warp(startTime + 1);

        // Join campaign as participant1
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        QuestRewardsContract.Participant memory participant = questContract
            .getParticipant(campaignId, participant1);
        assertTrue(participant.isParticipant);
        assertEq(participant.questScore, 0);

        campaign = questContract.getCampaign(campaignId);
        assertEq(campaign.totalParticipants, 1);
    }

    function testEqualDistribution() public {
        // Create and activate campaign
        vm.startPrank(creator);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            100,
            REWARD_AMOUNT,
            0
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        mockToken.approve(address(questContract), campaign.depositRequired);
        questContract.activateCampaign(campaignId);
        vm.stopPrank();

        // Fast forward to campaign start
        vm.warp(startTime + 1);

        // Multiple participants join
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        vm.prank(participant3);
        questContract.joinCampaign(campaignId);

        // Fast forward past campaign end
        vm.warp(endTime + 1);

        // End campaign and distribute
        vm.prank(creator);
        questContract.endCampaignAndDistribute(campaignId);

        // Check rewards distributed equally
        uint256 expectedReward = REWARD_AMOUNT / 3; // 3 participants
        assertEq(mockToken.balanceOf(participant1), expectedReward);
        assertEq(mockToken.balanceOf(participant2), expectedReward);
        assertEq(mockToken.balanceOf(participant3), expectedReward);

        campaign = questContract.getCampaign(campaignId);
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Ended)
        );
        assertTrue(campaign.rewardsDistributed);
    }

    function testLuckyDrawDistribution() public {
        // Create and activate campaign
        vm.startPrank(creator);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            startTime,
            endTime,
            100,
            REWARD_AMOUNT,
            2 // 2 winners
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        mockToken.approve(address(questContract), campaign.depositRequired);
        questContract.activateCampaign(campaignId);
        vm.stopPrank();

        // Fast forward to campaign start
        vm.warp(startTime + 1);

        // Multiple participants join
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        vm.prank(participant3);
        questContract.joinCampaign(campaignId);

        // Fast forward past campaign end
        vm.warp(endTime + 1);

        // End campaign and distribute
        vm.prank(creator);
        questContract.endCampaignAndDistribute(campaignId);

        // Check that exactly 2 winners received rewards
        uint256 winnersWithRewards = 0;
        uint256 expectedRewardPerWinner = REWARD_AMOUNT / 2; // 2 winners

        if (mockToken.balanceOf(participant1) > 0) {
            assertEq(
                mockToken.balanceOf(participant1),
                expectedRewardPerWinner
            );
            winnersWithRewards++;
        }
        if (mockToken.balanceOf(participant2) > 0) {
            assertEq(
                mockToken.balanceOf(participant2),
                expectedRewardPerWinner
            );
            winnersWithRewards++;
        }
        if (mockToken.balanceOf(participant3) > 0) {
            assertEq(
                mockToken.balanceOf(participant3),
                expectedRewardPerWinner
            );
            winnersWithRewards++;
        }

        assertEq(winnersWithRewards, 2);

        address[] memory winners = questContract.getWinners(campaignId);
        assertEq(winners.length, 2);
    }

    function testPerformanceBasedDistribution() public {
        // Create and activate campaign
        vm.startPrank(creator);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.PerformanceBased,
            startTime,
            endTime,
            100,
            REWARD_AMOUNT,
            0
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        mockToken.approve(address(questContract), campaign.depositRequired);
        questContract.activateCampaign(campaignId);
        vm.stopPrank();

        // Fast forward to campaign start
        vm.warp(startTime + 1);

        // Multiple participants join
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        vm.prank(participant3);
        questContract.joinCampaign(campaignId);

        // Update quest scores (owner only)
        questContract.updateQuestScore(campaignId, participant1, 100); // 50% of total
        questContract.updateQuestScore(campaignId, participant2, 60); // 30% of total
        questContract.updateQuestScore(campaignId, participant3, 40); // 20% of total
        // Total score: 200

        // Fast forward past campaign end
        vm.warp(endTime + 1);

        // End campaign and distribute
        vm.prank(creator);
        questContract.endCampaignAndDistribute(campaignId);

        // Check rewards distributed based on performance
        uint256 expectedReward1 = (REWARD_AMOUNT * 100) / 200; // 50%
        uint256 expectedReward2 = (REWARD_AMOUNT * 60) / 200; // 30%
        uint256 expectedReward3 = (REWARD_AMOUNT * 40) / 200; // 20%

        assertEq(mockToken.balanceOf(participant1), expectedReward1);
        assertEq(mockToken.balanceOf(participant2), expectedReward2);
        assertEq(mockToken.balanceOf(participant3), expectedReward3);
    }

    function test_RevertWhen_JoinInactiveCampaign() public {
        vm.startPrank(creator);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            100,
            REWARD_AMOUNT,
            0
        );
        vm.stopPrank();

        // Try to join without activating campaign
        vm.warp(startTime + 1);
        vm.prank(participant1);
        vm.expectRevert("Campaign not active");
        questContract.joinCampaign(campaignId); // Should fail
    }

    function test_RevertWhen_DoubleJoin() public {
        // Create and activate campaign
        vm.startPrank(creator);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 7 days;

        uint256 campaignId = questContract.createCampaign(
            address(mockToken),
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            100,
            REWARD_AMOUNT,
            0
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        mockToken.approve(address(questContract), campaign.depositRequired);
        questContract.activateCampaign(campaignId);
        vm.stopPrank();

        vm.warp(startTime + 1);

        vm.startPrank(participant1);
        questContract.joinCampaign(campaignId);
        vm.expectRevert("Already joined");
        questContract.joinCampaign(campaignId); // Should fail
        vm.stopPrank();
    }
}
