// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Internal vault system for platform fees - no external treasury needed

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

    // Struct to help with createCampaign parameters to avoid stack too deep
    struct CampaignParams {
        address rewardToken;
        RewardDistributionMethod distributionMethod;
        uint256 startTime;
        uint256 endTime;
        uint256 maxParticipants;
        uint256 totalRewardAmount;
        uint256 numberOfWinners;
    }

    // ============ STATE VARIABLES ============

    uint256 public nextCampaignId = 1;
    // Minimum reward amount removed - campaigns can now be created with any amount >= 1 wei
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee
    uint256 public guaranteedRewardPerUser = 0.02 * 10 ** 6; // $0.02 in USDC

    // Campaign ID => Campaign
    mapping(uint256 => Campaign) public campaigns;

    // Campaign ID => Participant Address => Participant Data
    mapping(uint256 => mapping(address => Participant)) public participants;

    // Campaign ID => Array of participant addresses
    mapping(uint256 => address[]) public participantLists;

    // Campaign ID => Array of winners (for lucky draw)
    mapping(uint256 => address[]) public winners;

    // Platform fee vault - stores collected fees by token address
    mapping(address => uint256) public platformFeeVault;

    // Events for platform fee management
    event PlatformFeeCollected(address indexed token, uint256 amount);
    event PlatformFeeWithdrawn(
        address indexed token,
        uint256 amount,
        address indexed to
    );

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

    event GuaranteedRewardsWithdrawn(
        uint256 participantCount,
        uint256 totalAmount
    );

    // ============ GUARANTEED REWARDS ============

    /**
     * @dev Internal function to distribute guaranteed rewards to eligible participants
     * Note: Guaranteed rewards are disabled in this version - platform fees go to vault
     */
    function _distributeGuaranteedRewards(
        address[] memory eligibleParticipants
    ) internal {
        // Guaranteed rewards disabled - keeping function for interface compatibility
        // Future versions could implement this using platform fee vault
    }

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
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() {
        // Set USDC address (SEI Testnet)
        address usdcAddress;
        assembly {
            usdcAddress := 0x4fCF1784B31630811181f670Aea7A7bEF803eaED
        }
        USDC_ADDRESS = usdcAddress;

        // Set supported tokens (SEI and USDC only)
        supportedTokens[NATIVE_TOKEN] = true; // SEI (native token)
        supportedTokens[USDC_ADDRESS] = true; // USDC
    }

    // ============ CAMPAIGN MANAGEMENT ============

    /**
     * @dev Creates and activates a new campaign with SEI (native token) in one transaction
     * This function is payable and expects SEI to be sent
     */
    function createCampaign(
        address _rewardToken,
        RewardDistributionMethod _distributionMethod,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxParticipants,
        uint256 _totalRewardAmount,
        uint256 _numberOfWinners
    ) external payable whenNotPaused returns (uint256) {
        // Only allow SEI (native token) campaigns through this function
        require(
            _rewardToken == NATIVE_TOKEN,
            "Use createCampaignWithUSDC for USDC campaigns"
        );

        // Create params struct to avoid stack too deep
        CampaignParams memory params = CampaignParams({
            rewardToken: _rewardToken,
            distributionMethod: _distributionMethod,
            startTime: _startTime,
            endTime: _endTime,
            maxParticipants: _maxParticipants,
            totalRewardAmount: _totalRewardAmount,
            numberOfWinners: _numberOfWinners
        });

        return _createCampaignInternal(params);
    }

    /**
     * @dev Creates and activates a new campaign with USDC in one transaction
     * This function is NOT payable and expects USDC approval
     */
    function createCampaignWithUSDC(
        RewardDistributionMethod _distributionMethod,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxParticipants,
        uint256 _totalRewardAmount,
        uint256 _numberOfWinners
    ) external whenNotPaused returns (uint256) {
        // Create params struct to avoid stack too deep
        CampaignParams memory params = CampaignParams({
            rewardToken: USDC_ADDRESS,
            distributionMethod: _distributionMethod,
            startTime: _startTime,
            endTime: _endTime,
            maxParticipants: _maxParticipants,
            totalRewardAmount: _totalRewardAmount,
            numberOfWinners: _numberOfWinners
        });

        return _createCampaignInternal(params);
    }

    /**
     * @dev Internal function to create campaign - split to avoid stack too deep
     */
    function _createCampaignInternal(
        CampaignParams memory params
    ) internal returns (uint256) {
        require(
            supportedTokens[params.rewardToken],
            "Only SEI and USDC are supported"
        );

        require(
            params.totalRewardAmount > 0,
            "Reward amount must be greater than 0"
        );

        require(params.numberOfWinners > 0, "Must have at least 1 winner");

        uint256 campaignId = nextCampaignId++;
        uint256 platformFee = (params.totalRewardAmount *
            PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 depositRequired = params.totalRewardAmount + platformFee;

        // Create the campaign
        campaigns[campaignId] = Campaign({
            campaignId: campaignId,
            creator: msg.sender,
            rewardToken: params.rewardToken == NATIVE_TOKEN
                ? IERC20(address(0))
                : IERC20(params.rewardToken),
            distributionMethod: params.distributionMethod,
            startTime: params.startTime,
            endTime: params.endTime,
            maxParticipants: params.maxParticipants,
            status: CampaignStatus.Draft,
            totalRewardAmount: params.totalRewardAmount,
            platformFee: platformFee,
            guaranteedRewardPerUser: guaranteedRewardPerUser,
            depositRequired: depositRequired,
            numberOfWinners: params.numberOfWinners,
            totalParticipants: 0,
            rewardsDistributed: false
        });

        emit CampaignCreated(
            campaignId,
            msg.sender,
            params.rewardToken,
            params.distributionMethod,
            params.totalRewardAmount,
            params.startTime,
            params.endTime
        );

        // Activate the campaign by handling deposits
        _activateCampaignInternal(
            campaignId,
            params.rewardToken,
            depositRequired,
            platformFee
        );

        return campaignId;
    }

    /**
     * @dev Internal function to activate campaign - split to avoid stack too deep
     */
    function _activateCampaignInternal(
        uint256 campaignId,
        address rewardToken,
        uint256 depositRequired,
        uint256 platformFee
    ) internal {
        Campaign storage campaign = campaigns[campaignId];

        // Validate balances and transfers
        if (rewardToken == NATIVE_TOKEN) {
            require(msg.value >= depositRequired, "Insufficient SEI sent");
        } else {
            IERC20 token = IERC20(rewardToken);
            require(
                token.balanceOf(msg.sender) >= depositRequired,
                "Insufficient token balance"
            );
            require(
                token.allowance(msg.sender, address(this)) >= depositRequired,
                "Insufficient token allowance"
            );
            require(
                token.transferFrom(msg.sender, address(this), depositRequired),
                "Token transfer failed"
            );
        }

        // Store platform fee in vault
        address tokenAddress = rewardToken == NATIVE_TOKEN
            ? address(0)
            : rewardToken;
        platformFeeVault[tokenAddress] += platformFee;
        emit PlatformFeeCollected(tokenAddress, platformFee);

        // Activate the campaign
        campaign.status = CampaignStatus.Active;
    }

    /**
     * @dev Legacy function - campaigns are now automatically activated upon creation
     * This function is kept for backward compatibility but should not be used for new campaigns
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
        require(
            address(campaign.rewardToken) != address(0),
            "Use createCampaign for native tokens - this legacy function only supports ERC20"
        );

        uint256 platformFee = (campaign.totalRewardAmount *
            PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 depositRequired = campaign.totalRewardAmount + platformFee;

        campaign.platformFee = platformFee;
        campaign.depositRequired = depositRequired;

        require(
            campaign.rewardToken.balanceOf(msg.sender) >= depositRequired,
            "Insufficient token balance"
        );
        require(
            campaign.rewardToken.allowance(msg.sender, address(this)) >=
                depositRequired,
            "Insufficient token allowance"
        );
        require(
            campaign.rewardToken.transferFrom(
                msg.sender,
                address(this),
                depositRequired
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

        // Prevent cancellation after campaign has started
        require(
            block.timestamp < campaign.startTime,
            "Cannot cancel campaign after it has started"
        );

        require(!campaign.rewardsDistributed, "Rewards already distributed");

        uint256 refundAmount = campaign.totalRewardAmount +
            campaign.platformFee;
        campaign.status = CampaignStatus.Cancelled;

        // Remove platform fee from vault since it's being refunded
        address tokenAddress = address(campaign.rewardToken) == address(0)
            ? address(0)
            : address(campaign.rewardToken);
        platformFeeVault[tokenAddress] -= campaign.platformFee;

        // Refund total amount
        if (refundAmount > 0) {
            if (address(campaign.rewardToken) == address(0)) {
                (bool success, ) = campaign.creator.call{value: refundAmount}(
                    ""
                );
                require(success, "SEI refund failed");
            } else {
                require(
                    campaign.rewardToken.transfer(
                        campaign.creator,
                        refundAmount
                    ),
                    "Token refund failed"
                );
            }
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

        require(!campaign.rewardsDistributed, "Rewards already distributed");

        campaign.status = CampaignStatus.Ended;
        campaign.rewardsDistributed = true;

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

        // Get eligible participants
        address[] memory eligibleParticipants = _getEligibleParticipants(
            _campaignId,
            participantList
        );
        require(
            eligibleParticipants.length > 0,
            "No eligible participants (need 60+ quest points)"
        );

        uint256 winnersCount = campaign.numberOfWinners;
        if (winnersCount > eligibleParticipants.length) {
            winnersCount = eligibleParticipants.length;
        }

        return
            _distributeToWinners(
                _campaignId,
                eligibleParticipants,
                winnersCount
            );
    }

    /**
     * @dev Equal distribution among all participants
     */
    function _distributeEqual(uint256 _campaignId) internal returns (uint256) {
        address[] memory participantList = participantLists[_campaignId];
        require(participantList.length > 0, "No participants");

        address[] memory eligibleParticipants = _getEligibleParticipants(
            _campaignId,
            participantList
        );
        require(
            eligibleParticipants.length > 0,
            "No eligible participants (need 60+ quest points)"
        );

        return
            _distributeToWinners(
                _campaignId,
                eligibleParticipants,
                eligibleParticipants.length
            );
    }

    /**
     * @dev Get eligible participants with 60+ quest points
     */
    function _getEligibleParticipants(
        uint256 _campaignId,
        address[] memory participantList
    ) internal view returns (address[] memory) {
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

        // Resize array to actual eligible count
        address[] memory result = new address[](eligibleCount);
        for (uint256 i = 0; i < eligibleCount; i++) {
            result[i] = eligibleParticipants[i];
        }
        return result;
    }

    /**
     * @dev Distribute rewards to winners
     */
    function _distributeToWinners(
        uint256 _campaignId,
        address[] memory eligibleParticipants,
        uint256 winnersCount
    ) internal returns (uint256) {
        Campaign storage campaign = campaigns[_campaignId];
        uint256 rewardPerWinner = campaign.totalRewardAmount / winnersCount;
        uint256 totalDistributed = 0;

        address[] memory selectedWinners = new address[](winnersCount);

        for (uint256 i = 0; i < winnersCount; i++) {
            uint256 randomIndex = uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.prevrandao, i)
                )
            ) % eligibleParticipants.length;

            address winner = eligibleParticipants[randomIndex];
            selectedWinners[i] = winner;

            _transferReward(campaign, winner, rewardPerWinner);

            participants[_campaignId][winner].rewardClaimed = true;
            totalDistributed += rewardPerWinner;
            totalEarnings[winner] += rewardPerWinner;

            emit RewardDistributed(
                _campaignId,
                winner,
                rewardPerWinner,
                campaign.distributionMethod
            );
        }

        _distributeGuaranteedRewards(selectedWinners);

        if (winnersCount < eligibleParticipants.length) {
            winners[_campaignId] = selectedWinners;
            emit WinnersSelected(_campaignId, selectedWinners);
        }

        return totalDistributed;
    }

    /**
     * @dev Transfer reward to recipient
     */
    function _transferReward(
        Campaign storage campaign,
        address recipient,
        uint256 amount
    ) internal {
        if (address(campaign.rewardToken) == address(0)) {
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "SEI reward transfer failed");
        } else {
            require(
                campaign.rewardToken.transfer(recipient, amount),
                "Reward token transfer failed"
            );
        }
    }

    // ============ VIEW FUNCTIONS ============

    function getCampaign(
        uint256 _campaignId
    ) external view returns (Campaign memory) {
        return campaigns[_campaignId];
    }

    function getParticipant(
        uint256 _campaignId,
        address _participant
    ) external view returns (Participant memory) {
        return participants[_campaignId][_participant];
    }

    function getParticipants(
        uint256 _campaignId
    ) external view returns (address[] memory) {
        return participantLists[_campaignId];
    }

    function getWinners(
        uint256 _campaignId
    ) external view returns (address[] memory) {
        return winners[_campaignId];
    }

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

    function addSupportedToken(address _token) external onlyOwner {
        require(
            _token == NATIVE_TOKEN || _token == USDC_ADDRESS,
            "Only SEI and USDC are supported"
        );
        supportedTokens[_token] = true;
    }

    function removeSupportedToken(address _token) external onlyOwner {
        require(
            _token != NATIVE_TOKEN && _token != USDC_ADDRESS,
            "Cannot remove SEI or USDC"
        );
        supportedTokens[_token] = false;
    }

    function updateGuaranteedReward(uint256 _newAmount) external onlyOwner {
        guaranteedRewardPerUser = _newAmount;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawPlatformFees(
        address _token,
        uint256 _amount,
        address _to
    ) external onlyOwner {
        require(_to != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _amount <= platformFeeVault[_token],
            "Insufficient vault balance"
        );

        platformFeeVault[_token] -= _amount;

        if (_token == address(0)) {
            payable(_to).transfer(_amount);
        } else {
            require(
                IERC20(_token).transfer(_to, _amount),
                "Token transfer failed"
            );
        }

        emit PlatformFeeWithdrawn(_token, _amount, _to);
    }

    function getPlatformFeeBalance(
        address _token
    ) external view returns (uint256) {
        return platformFeeVault[_token];
    }

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

    function getUserTotalQuestPoints(
        address _user
    ) external view returns (uint256) {
        return totalQuestPoints[_user];
    }

    function getUserTotalEarnings(
        address _user
    ) external view returns (uint256) {
        return totalEarnings[_user];
    }

    function getUserLevel(address _user) external view returns (uint256) {
        uint256 qp = totalQuestPoints[_user];
        return (qp / 500) + 1;
    }

    function getQPForNextLevel(address _user) external view returns (uint256) {
        uint256 qp = totalQuestPoints[_user];
        uint256 currentLevel = (qp / 500) + 1;
        return (currentLevel * 500) - qp;
    }
}
