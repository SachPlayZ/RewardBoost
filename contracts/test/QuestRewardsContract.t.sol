// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/QuestRewardsContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract QuestRewardsContractTest is Test {
    QuestRewardsContract public questContract;
    address public owner;
    address public creator;
    address public participant1;
    address public participant2;

    // Constants from the contract
    // Minimum reward amount removed - campaigns can now be created with any amount >= 1 wei
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 5; // 5%
    address public constant NATIVE_TOKEN = address(0); // SEI

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        address indexed rewardToken,
        QuestRewardsContract.RewardDistributionMethod distributionMethod,
        uint256 totalRewardAmount,
        uint256 startTime,
        uint256 endTime
    );

    function setUp() public {
        owner = address(this);
        creator = makeAddr("creator");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");

        questContract = new QuestRewardsContract();

        // Fund accounts with SEI
        vm.deal(creator, 1000 ether);
        vm.deal(participant1, 100 ether);
        vm.deal(participant2, 100 ether);
    }

    // ============ HELPER FUNCTIONS ============

    function _createTestSEICampaign() internal returns (uint256) {
        return _createTestSEICampaignWithParams(100 * 10 ** 18, 100, 5);
    }

    function _createTestSEICampaignWithParams(
        uint256 totalRewardAmount,
        uint256 maxParticipants,
        uint256 numberOfWinners
    ) internal returns (uint256) {
        vm.startPrank(creator);

        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        uint256 startTime = block.timestamp + 3600;
        uint256 endTime = startTime + 86400;

        uint256 campaignId = questContract.createCampaign{value: totalRequired}(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            startTime,
            endTime,
            maxParticipants,
            totalRewardAmount,
            numberOfWinners
        );

        vm.stopPrank();
        return campaignId;
    }

    function _createTestSEICampaignEqualDist() internal returns (uint256) {
        vm.startPrank(creator);

        uint256 totalRewardAmount = 200 * 10 ** 18;
        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        uint256 startTime = block.timestamp + 3600;
        uint256 endTime = startTime + 86400;

        uint256 campaignId = questContract.createCampaign{value: totalRequired}(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            100,
            totalRewardAmount,
            5 // Ignored for equal distribution
        );

        vm.stopPrank();
        return campaignId;
    }

    function testCreateCampaignWithSEIOnly() public {
        vm.startPrank(creator);

        // Calculate required amounts
        uint256 totalRewardAmount = 100 * 10 ** 18; // 100 SEI
        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        // Campaign parameters
        uint256 startTime = block.timestamp + 3600; // 1 hour from now
        uint256 endTime = startTime + 86400; // 24 hours duration
        uint256 maxParticipants = 100;
        uint256 numberOfWinners = 5;

        // Record balances before
        uint256 creatorBalanceBefore = creator.balance;
        uint256 contractBalanceBefore = address(questContract).balance;

        // Expect the CampaignCreated event
        vm.expectEmit(true, true, true, true);
        emit CampaignCreated(
            1, // campaignId
            creator,
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            totalRewardAmount,
            startTime,
            endTime
        );

        // Create campaign with SEI
        uint256 campaignId = questContract.createCampaign{value: totalRequired}(
            NATIVE_TOKEN, // Use SEI as reward token
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            startTime,
            endTime,
            maxParticipants,
            totalRewardAmount,
            numberOfWinners
        );

        vm.stopPrank();

        // Verify campaign was created with correct ID
        assertEq(campaignId, 1);

        // Verify campaign details
        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);

        assertEq(campaign.campaignId, 1);
        assertEq(campaign.creator, creator);
        assertEq(address(campaign.rewardToken), address(0)); // SEI is address(0)
        assertEq(
            uint256(campaign.distributionMethod),
            uint256(QuestRewardsContract.RewardDistributionMethod.LuckyDraw)
        );
        assertEq(campaign.startTime, startTime);
        assertEq(campaign.endTime, endTime);
        assertEq(campaign.maxParticipants, maxParticipants);
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Active)
        );
        assertEq(campaign.totalRewardAmount, totalRewardAmount);
        assertEq(campaign.platformFee, platformFee);
        assertEq(campaign.numberOfWinners, numberOfWinners);
        assertEq(campaign.totalParticipants, 0);
        assertEq(campaign.rewardsDistributed, false);

        // Verify balances after campaign creation
        uint256 creatorBalanceAfter = creator.balance;
        uint256 contractBalanceAfter = address(questContract).balance;

        assertEq(creatorBalanceBefore - creatorBalanceAfter, totalRequired);
        assertEq(contractBalanceAfter - contractBalanceBefore, totalRequired);

        // Verify platform fee was recorded
        assertEq(
            questContract.getPlatformFeeBalance(NATIVE_TOKEN),
            platformFee
        );

        // Verify SEI is supported token
        assertTrue(questContract.supportedTokens(NATIVE_TOKEN));
    }

    function testCreateCampaignWithSEIInsufficientFunds() public {
        vm.startPrank(creator);

        uint256 totalRewardAmount = 100 * 10 ** 18; // 100 SEI
        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        uint256 startTime = block.timestamp + 3600;
        uint256 endTime = startTime + 86400;

        // Try to create campaign without sending enough SEI
        vm.expectRevert("Insufficient SEI sent");
        questContract.createCampaign{value: totalRequired - 1 ether}(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            startTime,
            endTime,
            100,
            totalRewardAmount,
            5
        );

        vm.stopPrank();
    }

    function testCreateCampaignWithSEIEqualDistribution() public {
        vm.startPrank(creator);

        uint256 totalRewardAmount = 200 * 10 ** 18; // 200 SEI
        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        uint256 startTime = block.timestamp + 3600;
        uint256 endTime = startTime + 86400;

        // Create campaign with equal distribution method
        uint256 campaignId = questContract.createCampaign{value: totalRequired}(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime,
            endTime,
            50,
            totalRewardAmount,
            10 // This parameter is ignored for equal distribution but required
        );

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);

        assertEq(
            uint256(campaign.distributionMethod),
            uint256(
                QuestRewardsContract.RewardDistributionMethod.EqualDistribution
            )
        );
        assertEq(campaign.totalRewardAmount, totalRewardAmount);
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Active)
        );

        vm.stopPrank();
    }

    function testCreateCampaignWithZeroAmount() public {
        vm.startPrank(creator);

        // Test that zero reward amount is rejected
        uint256 totalRewardAmount = 0; // Zero amount should be rejected
        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        uint256 startTime = block.timestamp + 3600;
        uint256 endTime = startTime + 86400;

        vm.expectRevert("Reward amount must be greater than 0");
        questContract.createCampaign{value: totalRequired}(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            startTime,
            endTime,
            100,
            totalRewardAmount,
            5
        );

        vm.stopPrank();
    }

    function testCreateCampaignWithMinimumAmount() public {
        vm.startPrank(creator);

        // Test creating campaign with the new minimum (1 USDC = 1 * 10^6)
        uint256 totalRewardAmount = 1 * 10 ** 6; // 1 USDC
        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        uint256 startTime = block.timestamp + 3600;
        uint256 endTime = startTime + 86400;

        // This should now succeed
        uint256 campaignId = questContract.createCampaign{value: totalRequired}(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            startTime,
            endTime,
            100,
            totalRewardAmount,
            5
        );

        // Verify campaign was created
        assertTrue(campaignId > 0);

        vm.stopPrank();
    }

    function testCreateMultipleSEICampaigns() public {
        vm.startPrank(creator);

        uint256 totalRewardAmount = 100 * 10 ** 18;
        uint256 platformFee = (totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            100;
        uint256 totalRequired = totalRewardAmount + platformFee;

        uint256 startTime = block.timestamp + 3600;
        uint256 endTime = startTime + 86400;

        // Create first campaign
        uint256 campaignId1 = questContract.createCampaign{
            value: totalRequired
        }(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            startTime,
            endTime,
            100,
            totalRewardAmount,
            5
        );

        // Create second campaign
        uint256 campaignId2 = questContract.createCampaign{
            value: totalRequired
        }(
            NATIVE_TOKEN,
            QuestRewardsContract.RewardDistributionMethod.EqualDistribution,
            startTime + 86400, // Next day
            endTime + 86400,
            50,
            totalRewardAmount,
            10
        );

        assertEq(campaignId1, 1);
        assertEq(campaignId2, 2);

        // Verify both campaigns exist and have correct details
        QuestRewardsContract.Campaign memory campaign1 = questContract
            .getCampaign(campaignId1);
        QuestRewardsContract.Campaign memory campaign2 = questContract
            .getCampaign(campaignId2);

        assertEq(campaign1.campaignId, 1);
        assertEq(campaign2.campaignId, 2);

        assertEq(campaign1.creator, creator);
        assertEq(campaign2.creator, creator);

        // Verify platform fees accumulated correctly
        assertEq(
            questContract.getPlatformFeeBalance(NATIVE_TOKEN),
            platformFee * 2
        );

        vm.stopPrank();
    }

    // ============ JOINING CAMPAIGN TESTS ============

    function testJoinSEICampaignSuccess() public {
        // Create a campaign first
        uint256 campaignId = _createTestSEICampaign();

        // Fast forward to campaign start
        vm.warp(block.timestamp + 3700); // Past start time

        // Test participant joining
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        // Verify participant joined
        QuestRewardsContract.Participant memory participant = questContract
            .getParticipant(campaignId, participant1);
        assertTrue(participant.isParticipant);
        assertEq(participant.questScore, 0);
        assertEq(participant.joinedAt, block.timestamp);
        assertEq(participant.rewardClaimed, false);

        // Verify campaign participant count updated
        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        assertEq(campaign.totalParticipants, 1);

        // Verify participant is in the list
        address[] memory participants = questContract.getParticipants(
            campaignId
        );
        assertEq(participants.length, 1);
        assertEq(participants[0], participant1);
    }

    function testJoinSEICampaignMultipleParticipants() public {
        uint256 campaignId = _createTestSEICampaign();
        vm.warp(block.timestamp + 3700); // Past start time

        // Multiple participants join
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        // Add a third participant
        address participant3 = makeAddr("participant3");
        vm.prank(participant3);
        questContract.joinCampaign(campaignId);

        // Verify all participants joined
        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        assertEq(campaign.totalParticipants, 3);

        address[] memory participants = questContract.getParticipants(
            campaignId
        );
        assertEq(participants.length, 3);
        assertEq(participants[0], participant1);
        assertEq(participants[1], participant2);
        assertEq(participants[2], participant3);
    }

    function testJoinSEICampaignErrors() public {
        uint256 campaignId = _createTestSEICampaign();

        // Test double joining
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant1);
        vm.expectRevert("Already joined");
        questContract.joinCampaign(campaignId);
    }

    function testJoinSEICampaignWithMaxParticipants() public {
        // Create campaign with max 2 participants
        uint256 campaignId = _createTestSEICampaignWithParams(
            100 * 10 ** 18,
            2,
            1
        );

        vm.warp(block.timestamp + 3700);

        // First two participants join successfully
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        // Third participant should fail
        address participant3 = makeAddr("participant3");
        vm.prank(participant3);
        vm.expectRevert("Campaign full");
        questContract.joinCampaign(campaignId);
    }

    // ============ QUEST SCORE TESTS ============

    function testUpdateQuestScoreInSEICampaign() public {
        uint256 campaignId = _createTestSEICampaign();
        vm.warp(block.timestamp + 3700);

        // Participant joins
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        // Update quest score (only owner can do this)
        questContract.updateQuestScore(campaignId, participant1, 75);

        // Verify quest score updated
        QuestRewardsContract.Participant memory participant = questContract
            .getParticipant(campaignId, participant1);
        assertEq(participant.questScore, 75);

        // Verify total quest points updated
        assertEq(questContract.getUserTotalQuestPoints(participant1), 75);

        // Update score again (should only add the difference)
        questContract.updateQuestScore(campaignId, participant1, 100);
        assertEq(questContract.getUserTotalQuestPoints(participant1), 100);

        // Verify participant data
        participant = questContract.getParticipant(campaignId, participant1);
        assertEq(participant.questScore, 100);
    }

    function testUpdateQuestScoreErrors() public {
        uint256 campaignId = _createTestSEICampaign();
        vm.warp(block.timestamp + 3700);

        // Try updating score for non-participant
        vm.expectRevert("Not a participant");
        questContract.updateQuestScore(campaignId, participant1, 50);

        // Participant joins
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        // Non-owner tries to update score
        vm.prank(participant2);
        vm.expectRevert();
        questContract.updateQuestScore(campaignId, participant1, 50);
    }

    function testUserLevelAndNextLevel() public {
        uint256 campaignId = _createTestSEICampaign();
        vm.warp(block.timestamp + 3700);

        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        // Initially level 1, needs 500 QP for next level
        assertEq(questContract.getUserLevel(participant1), 1);
        assertEq(questContract.getQPForNextLevel(participant1), 500);

        // Update to 250 QP
        questContract.updateQuestScore(campaignId, participant1, 250);
        assertEq(questContract.getUserLevel(participant1), 1);
        assertEq(questContract.getQPForNextLevel(participant1), 250);

        // Update to 500 QP - should be level 2
        questContract.updateQuestScore(campaignId, participant1, 500);
        assertEq(questContract.getUserLevel(participant1), 2);
        assertEq(questContract.getQPForNextLevel(participant1), 500);
    }

    // ============ REWARD DISTRIBUTION TESTS - LUCKY DRAW ============

    function testSEILuckyDrawDistributionSuccess() public {
        uint256 totalRewardAmount = 100 * 10 ** 18;
        uint256 campaignId = _createTestSEICampaignWithParams(
            totalRewardAmount,
            100,
            2
        );

        vm.warp(block.timestamp + 3700);

        // Add participants with eligible scores (60+)
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        address participant3 = makeAddr("participant3");
        vm.deal(participant3, 100 ether);
        vm.prank(participant3);
        questContract.joinCampaign(campaignId);

        // Update quest scores to make them eligible (need 60+ points)
        questContract.updateQuestScore(campaignId, participant1, 75);
        questContract.updateQuestScore(campaignId, participant2, 80);
        questContract.updateQuestScore(campaignId, participant3, 65);

        // Record balances before distribution
        uint256 participant1BalanceBefore = participant1.balance;
        uint256 participant2BalanceBefore = participant2.balance;
        uint256 participant3BalanceBefore = participant3.balance;
        uint256 contractBalanceBefore = address(questContract).balance;

        // Fast forward past campaign end
        vm.warp(block.timestamp + 86500);

        // End campaign and distribute rewards
        vm.prank(creator);
        questContract.endCampaignAndDistribute(campaignId);

        // Verify campaign ended
        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Ended)
        );
        assertTrue(campaign.rewardsDistributed);

        // Calculate expected reward per winner
        uint256 expectedRewardPerWinner = totalRewardAmount / 2; // 2 winners

        // Check that some participants received rewards (since it's random, we can't predict exactly who)
        uint256 totalDistributed = 0;
        if (participant1.balance > participant1BalanceBefore) {
            totalDistributed += (participant1.balance -
                participant1BalanceBefore);
        }
        if (participant2.balance > participant2BalanceBefore) {
            totalDistributed += (participant2.balance -
                participant2BalanceBefore);
        }
        if (participant3.balance > participant3BalanceBefore) {
            totalDistributed += (participant3.balance -
                participant3BalanceBefore);
        }

        // Verify total distributed equals expected (2 winners * reward per winner)
        assertEq(totalDistributed, expectedRewardPerWinner * 2);

        // Verify contract balance decreased by total distributed
        assertEq(
            contractBalanceBefore - address(questContract).balance,
            totalDistributed
        );
    }

    function testSEILuckyDrawIneligibleParticipants() public {
        uint256 campaignId = _createTestSEICampaignWithParams(
            100 * 10 ** 18,
            100,
            2
        );

        vm.warp(block.timestamp + 3700);

        // Add participants with ineligible scores (below 60)
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        // Update quest scores below eligibility threshold
        questContract.updateQuestScore(campaignId, participant1, 30);
        questContract.updateQuestScore(campaignId, participant2, 45);

        // Fast forward past campaign end
        vm.warp(block.timestamp + 86500);

        // Should fail with no eligible participants
        vm.prank(creator);
        vm.expectRevert("No eligible participants (need 60+ quest points)");
        questContract.endCampaignAndDistribute(campaignId);
    }

    // ============ REWARD DISTRIBUTION TESTS - EQUAL DISTRIBUTION ============

    function testSEIEqualDistributionSuccess() public {
        uint256 campaignId = _createTestSEICampaignEqualDist();

        vm.warp(block.timestamp + 3700);

        // Add 3 participants
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        vm.prank(participant2);
        questContract.joinCampaign(campaignId);

        address participant3 = makeAddr("participant3");
        vm.deal(participant3, 100 ether);
        vm.prank(participant3);
        questContract.joinCampaign(campaignId);

        // Make all participants eligible
        questContract.updateQuestScore(campaignId, participant1, 75);
        questContract.updateQuestScore(campaignId, participant2, 80);
        questContract.updateQuestScore(campaignId, participant3, 65);

        // Record balances before distribution
        uint256 participant1BalanceBefore = participant1.balance;
        uint256 participant2BalanceBefore = participant2.balance;
        uint256 participant3BalanceBefore = participant3.balance;

        // Fast forward past campaign end
        vm.warp(block.timestamp + 86500);

        // End campaign and distribute rewards
        vm.prank(creator);
        questContract.endCampaignAndDistribute(campaignId);

        // Calculate expected reward per participant (equal distribution)
        uint256 totalReward = 200 * 10 ** 18; // totalRewardAmount from helper function
        uint256 expectedRewardPerParticipant = totalReward / 3; // 3 participants

        // Verify all participants received equal rewards
        assertEq(
            participant1.balance - participant1BalanceBefore,
            expectedRewardPerParticipant
        );
        assertEq(
            participant2.balance - participant2BalanceBefore,
            expectedRewardPerParticipant
        );
        assertEq(
            participant3.balance - participant3BalanceBefore,
            expectedRewardPerParticipant
        );

        // Verify total earnings updated
        assertEq(
            questContract.getUserTotalEarnings(participant1),
            expectedRewardPerParticipant
        );
        assertEq(
            questContract.getUserTotalEarnings(participant2),
            expectedRewardPerParticipant
        );
        assertEq(
            questContract.getUserTotalEarnings(participant3),
            expectedRewardPerParticipant
        );
    }

    // ============ CAMPAIGN CANCELLATION TESTS ============

    function testCancelSEICampaignBeforeStart() public {
        uint256 totalRewardAmount = 100 * 10 ** 18;
        uint256 campaignId = _createTestSEICampaignWithParams(
            totalRewardAmount,
            100,
            5
        );

        // Record creator balance before cancellation
        uint256 creatorBalanceBefore = creator.balance;
        uint256 expectedRefund = totalRewardAmount +
            ((totalRewardAmount * PLATFORM_FEE_PERCENTAGE) / 100);

        // Cancel campaign before it starts
        vm.prank(creator);
        questContract.cancelCampaign(campaignId);

        // Verify campaign was cancelled
        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Cancelled)
        );

        // Verify creator received refund
        assertEq(creator.balance - creatorBalanceBefore, expectedRefund);

        // Verify platform fee vault was reduced
        assertEq(questContract.getPlatformFeeBalance(NATIVE_TOKEN), 0);
    }

    function testCancelSEICampaignErrors() public {
        uint256 campaignId = _createTestSEICampaign();

        // Fast forward past campaign start
        vm.warp(block.timestamp + 3700);

        // Should not be able to cancel after campaign started
        vm.prank(creator);
        vm.expectRevert("Cannot cancel campaign after it has started");
        questContract.cancelCampaign(campaignId);

        // Non-creator should not be able to cancel
        vm.prank(participant1);
        vm.expectRevert("Not campaign creator");
        questContract.cancelCampaign(campaignId);
    }

    // ============ PLATFORM FEE TESTS ============

    function testWithdrawSEIPlatformFees() public {
        // Create multiple campaigns to accumulate fees
        _createTestSEICampaign();
        _createTestSEICampaign();

        uint256 expectedTotalFees = 2 *
            ((100 * 10 ** 18 * PLATFORM_FEE_PERCENTAGE) / 100);

        // Verify fees accumulated
        assertEq(
            questContract.getPlatformFeeBalance(NATIVE_TOKEN),
            expectedTotalFees
        );

        // Withdraw fees
        address recipient = makeAddr("recipient");
        uint256 recipientBalanceBefore = recipient.balance;

        questContract.withdrawPlatformFees(
            NATIVE_TOKEN,
            expectedTotalFees,
            recipient
        );

        // Verify withdrawal
        assertEq(recipient.balance - recipientBalanceBefore, expectedTotalFees);
        assertEq(questContract.getPlatformFeeBalance(NATIVE_TOKEN), 0);
    }

    function testWithdrawSEIPlatformFeesErrors() public {
        _createTestSEICampaign();

        uint256 availableFees = questContract.getPlatformFeeBalance(
            NATIVE_TOKEN
        );

        // Non-owner cannot withdraw
        vm.prank(participant1);
        vm.expectRevert();
        questContract.withdrawPlatformFees(
            NATIVE_TOKEN,
            availableFees,
            participant1
        );

        // Cannot withdraw more than available
        vm.expectRevert("Insufficient vault balance");
        questContract.withdrawPlatformFees(
            NATIVE_TOKEN,
            availableFees + 1 ether,
            owner
        );

        // Cannot withdraw to zero address
        vm.expectRevert("Invalid recipient address");
        questContract.withdrawPlatformFees(
            NATIVE_TOKEN,
            availableFees,
            address(0)
        );
    }

    // ============ VIEW FUNCTIONS TESTS ============

    function testViewFunctions() public {
        uint256 campaignId = _createTestSEICampaign();
        vm.warp(block.timestamp + 3700);

        // Test campaign details
        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        assertEq(campaign.campaignId, campaignId);
        assertEq(campaign.creator, creator);

        // Test participants before joining
        address[] memory participants = questContract.getParticipants(
            campaignId
        );
        assertEq(participants.length, 0);

        // Join and test again
        vm.prank(participant1);
        questContract.joinCampaign(campaignId);

        participants = questContract.getParticipants(campaignId);
        assertEq(participants.length, 1);
        assertEq(participants[0], participant1);

        // Test eligibility
        assertFalse(
            questContract.isEligibleForReward(campaignId, participant1)
        ); // Campaign not ended

        // Test quest points and earnings
        assertEq(questContract.getUserTotalQuestPoints(participant1), 0);
        assertEq(questContract.getUserTotalEarnings(participant1), 0);
    }

    function testCreateCampaignWithUSDC() public {
        // Setup USDC mock calls
        vm.mockCall(
            address(0x4fCF1784B31630811181f670Aea7A7bEF803eaED),
            abi.encodeWithSelector(IERC20.balanceOf.selector, address(this)),
            abi.encode(1000000000) // 1000 USDC
        );
        vm.mockCall(
            address(0x4fCF1784B31630811181f670Aea7A7bEF803eaED),
            abi.encodeWithSelector(
                IERC20.allowance.selector,
                address(this),
                address(questContract)
            ),
            abi.encode(1000000000) // 1000 USDC allowance
        );
        vm.mockCall(
            address(0x4fCF1784B31630811181f670Aea7A7bEF803eaED),
            abi.encodeWithSelector(
                IERC20.transferFrom.selector,
                address(this),
                address(questContract),
                105000000
            ),
            abi.encode(true)
        );

        // Create campaign with USDC using the new function
        uint256 campaignId = questContract.createCampaignWithUSDC(
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            block.timestamp + 1 hours,
            block.timestamp + 24 hours,
            100,
            100000000, // 100 USDC
            10
        );

        // Verify campaign was created
        assertEq(campaignId, 1);

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        assertEq(campaign.creator, address(this));
        assertEq(
            address(campaign.rewardToken),
            address(0x4fCF1784B31630811181f670Aea7A7bEF803eaED)
        );
        assertEq(
            uint256(campaign.distributionMethod),
            uint256(QuestRewardsContract.RewardDistributionMethod.LuckyDraw)
        );
        assertEq(campaign.totalRewardAmount, 100000000);
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Active)
        );
    }

    function testCreateCampaignWithUSDCFailsIfNotEnoughAllowance() public {
        // Setup USDC mock with insufficient allowance
        vm.mockCall(
            address(0x4fCF1784B31630811181f670Aea7A7bEF803eaED),
            abi.encodeWithSelector(IERC20.balanceOf.selector, address(this)),
            abi.encode(1000000000) // 1000 USDC
        );
        vm.mockCall(
            address(0x4fCF1784B31630811181f670Aea7A7bEF803eaED),
            abi.encodeWithSelector(
                IERC20.allowance.selector,
                address(this),
                address(questContract)
            ),
            abi.encode(50000000) // 50 USDC allowance (less than required)
        );

        // Should fail due to insufficient allowance
        vm.expectRevert("Insufficient token allowance");
        questContract.createCampaignWithUSDC(
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            block.timestamp + 1 hours,
            block.timestamp + 24 hours,
            100,
            100000000, // 100 USDC
            10
        );
    }

    function testCreateCampaignWithSEIOnlyWorksWithOriginalFunction() public {
        // Should work with original function for SEI
        uint256 campaignId = questContract.createCampaign{value: 105000000}(
            address(0), // NATIVE_TOKEN
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            block.timestamp + 1 hours,
            block.timestamp + 24 hours,
            100,
            100000000, // 100 SEI
            10
        );

        assertEq(campaignId, 1);

        QuestRewardsContract.Campaign memory campaign = questContract
            .getCampaign(campaignId);
        assertEq(campaign.creator, address(this));
        assertEq(address(campaign.rewardToken), address(0));
        assertEq(
            uint256(campaign.status),
            uint256(QuestRewardsContract.CampaignStatus.Active)
        );
    }

    function testCreateCampaignWithUSDCFailsWithOriginalFunction() public {
        // Should fail when trying to use original function with USDC
        vm.expectRevert("Use createCampaignWithUSDC for USDC campaigns");
        questContract.createCampaign{value: 0}(
            address(0x4fCF1784B31630811181f670Aea7A7bEF803eaED), // USDC address
            QuestRewardsContract.RewardDistributionMethod.LuckyDraw,
            block.timestamp + 1 hours,
            block.timestamp + 24 hours,
            100,
            100000000, // 100 USDC
            10
        );
    }
}
