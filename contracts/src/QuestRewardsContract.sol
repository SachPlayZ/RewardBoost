// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title QuestRewardsContract
 * @dev Smart contract for managing Web3 quest campaigns with multiple reward distribution methods
 */
contract QuestRewardsContract is ReentrancyGuard, Ownable, Pausable {
    // ============ ENUMS ============

    enum RewardDistributionMethod {
        LuckyDraw,
        EqualDistribution
    }

    enum CampaignStatus {
        Draft,
        Active,
        Ended,
        Cancelled
    }

    // ============ STRUCTS ============

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
        uint256 numberOfWinners; // Only for LuckyDraw
        uint256 totalParticipants;
        bool rewardsDistributed;
    }

    struct Participant {
        bool isParticipant;
        uint256 questScore; // For performance-based rewards
        uint256 joinedAt;
        bool rewardClaimed;
    }

    // ============ STATE VARIABLES ============

    uint256 public nextCampaignId = 1;
    uint256 public constant MINIMUM_REWARD_AMOUNT = 50 * 10 ** 6; // $50 in USDC (6 decimals)
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 250; // 2.5% (basis points)
    uint256 public guaranteedRewardPerUser = 0.01 * 10 ** 6; // $0.01 in USDC

    // Campaign ID => Campaign
    mapping(uint256 => Campaign) public campaigns;

    // Campaign ID => Participant Address => Participant Data
    mapping(uint256 => mapping(address => Participant)) public participants;

    // Campaign ID => Array of participant addresses
    mapping(uint256 => address[]) public participantLists;

    // Campaign ID => Array of winners (for lucky draw)
    mapping(uint256 => address[]) public winners;

    // Platform treasury for collecting fees
    address public treasury;

    // Supported reward tokens (SEI and USDC only)
    mapping(address => bool) public supportedTokens;

    // Total accumulated quest points per wallet address across all campaigns
    mapping(address => uint256) public totalQuestPoints;

    // Total earnings per wallet address across all campaigns (in smallest unit)
    mapping(address => uint256) public totalEarnings;

    // USDC contract address
    address public immutable USDC_ADDRESS;

    // Native token (SEI) address representation
    address public constant NATIVE_TOKEN = address(0);

    // ============ EVENTS ============

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        address indexed rewardToken,
        RewardDistributionMethod distributionMethod,
        uint256 totalRewardAmount,
        uint256 startTime,
        uint256 endTime
    );

    event ParticipantJoined(
        uint256 indexed campaignId,
        address indexed participant,
        uint256 timestamp
    );

    event QuestScoreUpdated(
        uint256 indexed campaignId,
        address indexed participant,
        uint256 newScore
    );

    event RewardDistributed(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount,
        RewardDistributionMethod method
    );

    event CampaignEnded(
        uint256 indexed campaignId,
        uint256 totalParticipants,
        uint256 totalRewardsDistributed
    );

    event CampaignCancelled(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 refundAmount
    );

    event WinnersSelected(uint256 indexed campaignId, address[] winners);

    event TotalQuestPointsUpdated(
        address indexed participant,
        uint256 newTotalPoints
    );

    // ============ MODIFIERS ============

    modifier onlyCreator(uint256 _campaignId) {
        require(
            campaigns[_campaignId].creator == msg.sender,
            "Not campaign creator"
        );
        _;
    }

    modifier campaignExists(uint256 _campaignId) {
        require(
            campaigns[_campaignId].campaignId != 0,
            "Campaign does not exist"
        );
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        Campaign memory campaign = campaigns[_campaignId];
        require(
            campaign.status == CampaignStatus.Active,
            "Campaign not active"
        );
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(address _treasury) {
        treasury = _treasury;

        // Set USDC address
        address usdcAddress;
        assembly {
            usdcAddress := 0x4fCF1784B31630811181f670Aea7Aea7A7bEF803eaED
        }
        USDC_ADDRESS = usdcAddress;

        // Set supported tokens (SEI and USDC only)
        supportedTokens[NATIVE_TOKEN] = true; // SEI (native token)
        supportedTokens[USDC_ADDRESS] = true; // USDC
    }

    // ============ CAMPAIGN MANAGEMENT ============

    /**
     * @dev Creates a new campaign
     */
    function createCampaign(
        address _rewardToken,
        RewardDistributionMethod _distributionMethod,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxParticipants,
        uint256 _totalRewardAmount,
        uint256 _numberOfWinners
    ) external whenNotPaused returns (uint256) {
        require(
            supportedTokens[_rewardToken],
            "Only SEI and USDC are supported"
        );

        require(
            _totalRewardAmount >= MINIMUM_REWARD_AMOUNT,
            "Reward amount too low"
        );
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_endTime <= _startTime + 365 days, "Campaign too long");

        require(_numberOfWinners > 0, "Must have at least 1 winner");

        uint256 campaignId = nextCampaignId++;

        uint256 platformFee = (_totalRewardAmount * PLATFORM_FEE_PERCENTAGE) /
            10000;
        uint256 depositRequired = _totalRewardAmount + platformFee;

        campaigns[campaignId] = Campaign({
            campaignId: campaignId,
            creator: msg.sender,
            rewardToken: IERC20(_rewardToken),
            distributionMethod: _distributionMethod,
            startTime: _startTime,
            endTime: _endTime,
            maxParticipants: _maxParticipants,
            status: CampaignStatus.Draft,
            totalRewardAmount: _totalRewardAmount,
            platformFee: platformFee,
            guaranteedRewardPerUser: guaranteedRewardPerUser,
            depositRequired: depositRequired,
            numberOfWinners: _numberOfWinners,
            totalParticipants: 0,
            rewardsDistributed: false
        });

        emit CampaignCreated(
            campaignId,
            msg.sender,
            _rewardToken,
            _distributionMethod,
            _totalRewardAmount,
            _startTime,
            _endTime
        );

        return campaignId;
    }

    /**
     * @dev Activates a campaign by depositing required tokens
     */
    function activateCampaign(
        uint256 _campaignId
    )
        external
        campaignExists(_campaignId)
        onlyCreator(_campaignId)
        nonReentrant
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            campaign.status == CampaignStatus.Draft,
            "Campaign already activated"
        );

        // Transfer required tokens to contract
        require(
            campaign.rewardToken.transferFrom(
                msg.sender,
                address(this),
                campaign.depositRequired
            ),
            "Token transfer failed"
        );

        campaign.status = CampaignStatus.Active;
    }

    /**
     * @dev Cancels a campaign and refunds deposited tokens
     */
    function cancelCampaign(
        uint256 _campaignId
    )
        external
        campaignExists(_campaignId)
        onlyCreator(_campaignId)
        nonReentrant
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            campaign.status == CampaignStatus.Draft ||
                campaign.status == CampaignStatus.Active,
            "Cannot cancel this campaign"
        );
        require(
            block.timestamp < campaign.startTime,
            "Cannot cancel campaign after it has started"
        );
        require(!campaign.rewardsDistributed, "Rewards already distributed");

        uint256 refundAmount = campaign.depositRequired;
        campaign.status = CampaignStatus.Cancelled;

        if (refundAmount > 0) {
            require(
                campaign.rewardToken.transfer(campaign.creator, refundAmount),
                "Refund failed"
            );
        }

        emit CampaignCancelled(_campaignId, campaign.creator, refundAmount);
    }

    // ============ PARTICIPATION ============

    /**
     * @dev Allows users to join a campaign
     */
    function joinCampaign(
        uint256 _campaignId
    )
        external
        campaignExists(_campaignId)
        campaignActive(_campaignId)
        whenNotPaused
    {
        Campaign storage campaign = campaigns[_campaignId];

        require(
            !participants[_campaignId][msg.sender].isParticipant,
            "Already joined"
        );
        require(
            campaign.maxParticipants == 0 ||
                campaign.totalParticipants < campaign.maxParticipants,
            "Campaign full"
        );

        participants[_campaignId][msg.sender] = Participant({
            isParticipant: true,
            questScore: 0,
            joinedAt: block.timestamp,
            rewardClaimed: false
        });

        participantLists[_campaignId].push(msg.sender);
        campaign.totalParticipants++;

        emit ParticipantJoined(_campaignId, msg.sender, block.timestamp);
    }

    /**
     * @dev Updates quest score for performance-based rewards (only owner/authorized addresses)
     */
    function updateQuestScore(
        uint256 _campaignId,
        address _participant,
        uint256 _score
    ) external onlyOwner campaignExists(_campaignId) {
        require(
            participants[_campaignId][_participant].isParticipant,
            "Not a participant"
        );

        // Calculate the difference to add to total quest points
        uint256 currentScore = participants[_campaignId][_participant]
            .questScore;
        if (_score > currentScore) {
            uint256 pointsToAdd = _score - currentScore;
            totalQuestPoints[_participant] += pointsToAdd;

            emit TotalQuestPointsUpdated(
                _participant,
                totalQuestPoints[_participant]
            );
        }

        // Update the per-campaign quest score
        participants[_campaignId][_participant].questScore = _score;

        emit QuestScoreUpdated(_campaignId, _participant, _score);
    }

    // ============ REWARD DISTRIBUTION ============

    /**
     * @dev Ends campaign and distributes rewards based on distribution method
     */
    function endCampaignAndDistribute(
        uint256 _campaignId
    )
        external
        campaignExists(_campaignId)
        onlyCreator(_campaignId)
        nonReentrant
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            campaign.status == CampaignStatus.Active,
            "Campaign not active"
        );
        require(block.timestamp > campaign.endTime, "Campaign not ended yet");
        require(!campaign.rewardsDistributed, "Rewards already distributed");

        campaign.status = CampaignStatus.Ended;
        campaign.rewardsDistributed = true;

        // Transfer platform fee to treasury
        if (campaign.platformFee > 0) {
            require(
                campaign.rewardToken.transfer(treasury, campaign.platformFee),
                "Platform fee transfer failed"
            );
        }

        uint256 totalDistributed = 0;

        if (campaign.distributionMethod == RewardDistributionMethod.LuckyDraw) {
            totalDistributed = _distributeLuckyDraw(_campaignId);
        } else if (
            campaign.distributionMethod ==
            RewardDistributionMethod.EqualDistribution
        ) {
            totalDistributed = _distributeEqual(_campaignId);
        }

        emit CampaignEnded(
            _campaignId,
            campaign.totalParticipants,
            totalDistributed
        );
    }

    /**
     * @dev Lucky draw distribution
     */
    function _distributeLuckyDraw(
        uint256 _campaignId
    ) internal returns (uint256) {
        Campaign storage campaign = campaigns[_campaignId];
        address[] memory participantList = participantLists[_campaignId];

        require(participantList.length > 0, "No participants");

        // Filter participants with at least 60 quest points
        address[] memory eligibleParticipants = new address[](
            participantList.length
        );
        uint256 eligibleCount = 0;

        for (uint256 i = 0; i < participantList.length; i++) {
            address participant = participantList[i];
            if (participants[_campaignId][participant].questScore >= 60) {
                eligibleParticipants[eligibleCount] = participant;
                eligibleCount++;
            }
        }

        require(
            eligibleCount > 0,
            "No eligible participants (need 60+ quest points)"
        );

        uint256 winnersCount = campaign.numberOfWinners;
        if (winnersCount > eligibleCount) {
            winnersCount = eligibleCount;
        }

        uint256 rewardPerWinner = campaign.totalRewardAmount / winnersCount;
        uint256 totalDistributed = 0;

        // Simple random selection from eligible participants
        address[] memory selectedWinners = new address[](winnersCount);

        for (uint256 i = 0; i < winnersCount; i++) {
            uint256 randomIndex = uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.prevrandao, i)
                )
            ) % eligibleCount;

            address winner = eligibleParticipants[randomIndex];
            selectedWinners[i] = winner;

            require(
                campaign.rewardToken.transfer(winner, rewardPerWinner),
                "Reward transfer failed"
            );

            participants[_campaignId][winner].rewardClaimed = true;
            totalDistributed += rewardPerWinner;

            // Track total earnings for the winner
            totalEarnings[winner] += rewardPerWinner;

            emit RewardDistributed(
                _campaignId,
                winner,
                rewardPerWinner,
                RewardDistributionMethod.LuckyDraw
            );
        }

        winners[_campaignId] = selectedWinners;
        emit WinnersSelected(_campaignId, selectedWinners);

        return totalDistributed;
    }

    /**
     * @dev Equal distribution among all participants
     */
    function _distributeEqual(uint256 _campaignId) internal returns (uint256) {
        Campaign storage campaign = campaigns[_campaignId];
        address[] memory participantList = participantLists[_campaignId];

        require(participantList.length > 0, "No participants");

        // Filter participants with at least 60 quest points
        address[] memory eligibleParticipants = new address[](
            participantList.length
        );
        uint256 eligibleCount = 0;

        for (uint256 i = 0; i < participantList.length; i++) {
            address participant = participantList[i];
            if (participants[_campaignId][participant].questScore >= 60) {
                eligibleParticipants[eligibleCount] = participant;
                eligibleCount++;
            }
        }

        require(
            eligibleCount > 0,
            "No eligible participants (need 60+ quest points)"
        );

        uint256 rewardPerParticipant = campaign.totalRewardAmount /
            eligibleCount;
        uint256 totalDistributed = 0;

        for (uint256 i = 0; i < eligibleCount; i++) {
            address participant = eligibleParticipants[i];

            require(
                campaign.rewardToken.transfer(
                    participant,
                    rewardPerParticipant
                ),
                "Reward transfer failed"
            );

            participants[_campaignId][participant].rewardClaimed = true;
            totalDistributed += rewardPerParticipant;

            // Track total earnings for the participant
            totalEarnings[participant] += rewardPerParticipant;

            emit RewardDistributed(
                _campaignId,
                participant,
                rewardPerParticipant,
                RewardDistributionMethod.EqualDistribution
            );
        }

        return totalDistributed;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get campaign details
     */
    function getCampaign(
        uint256 _campaignId
    ) external view returns (Campaign memory) {
        return campaigns[_campaignId];
    }

    /**
     * @dev Get participant details
     */
    function getParticipant(
        uint256 _campaignId,
        address _participant
    ) external view returns (Participant memory) {
        return participants[_campaignId][_participant];
    }

    /**
     * @dev Get all participants for a campaign
     */
    function getParticipants(
        uint256 _campaignId
    ) external view returns (address[] memory) {
        return participantLists[_campaignId];
    }

    /**
     * @dev Get winners for a lucky draw campaign
     */
    function getWinners(
        uint256 _campaignId
    ) external view returns (address[] memory) {
        return winners[_campaignId];
    }

    /**
     * @dev Check if user is eligible for rewards
     */
    function isEligibleForReward(
        uint256 _campaignId,
        address _user
    ) external view returns (bool) {
        Campaign memory campaign = campaigns[_campaignId];
        Participant memory participant = participants[_campaignId][_user];

        return
            participant.isParticipant &&
            campaign.status == CampaignStatus.Ended &&
            !participant.rewardClaimed;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Add supported token (only owner can call, but restricted to SEI and USDC)
     * Note: This function is kept for interface compatibility but only allows setting SEI and USDC
     */
    function addSupportedToken(address _token) external onlyOwner {
        require(
            _token == NATIVE_TOKEN || _token == USDC_ADDRESS,
            "Only SEI and USDC are supported"
        );
        supportedTokens[_token] = true;
    }

    /**
     * @dev Remove supported token (only owner can call)
     * Note: Cannot remove SEI or USDC as they are core supported tokens
     */
    function removeSupportedToken(address _token) external onlyOwner {
        require(
            _token != NATIVE_TOKEN && _token != USDC_ADDRESS,
            "Cannot remove SEI or USDC"
        );
        supportedTokens[_token] = false;
    }

    /**
     * @dev Update treasury address
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasury = _newTreasury;
    }

    /**
     * @dev Update guaranteed reward per user
     */
    function updateGuaranteedReward(uint256 _newAmount) external onlyOwner {
        guaranteedRewardPerUser = _newAmount;
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal (only for stuck tokens)
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount
    ) external onlyOwner {
        require(
            IERC20(_token).transfer(owner(), _amount),
            "Emergency withdrawal failed"
        );
    }

    // ============ QUEST POINTS VIEW FUNCTIONS ============

    /**
     * @dev Get user's total accumulated quest points across all campaigns
     */
    function getUserTotalQuestPoints(
        address _user
    ) external view returns (uint256) {
        return totalQuestPoints[_user];
    }

    /**
     * @dev Get user's total earnings across all campaigns (in smallest token unit)
     */
    function getUserTotalEarnings(
        address _user
    ) external view returns (uint256) {
        return totalEarnings[_user];
    }

    /**
     * @dev Calculate user's level based on total quest points
     * Level increases every 500 QP
     */
    function getUserLevel(address _user) external view returns (uint256) {
        uint256 qp = totalQuestPoints[_user];
        return (qp / 500) + 1; // Level 1 at 0 QP, Level 2 at 500 QP, etc.
    }

    /**
     * @dev Get QP needed for next level
     */
    function getQPForNextLevel(address _user) external view returns (uint256) {
        uint256 qp = totalQuestPoints[_user];
        uint256 currentLevel = (qp / 500) + 1;
        return (currentLevel * 500) - qp;
    }
}
