// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Treasury
 * @dev Treasury contract for managing platform fees and rewards distribution
 */
contract Treasury is ReentrancyGuard, Ownable, Pausable {
    // ============ STRUCTS ============

    struct TokenBalance {
        uint256 totalReceived;
        uint256 totalWithdrawn;
        uint256 currentBalance;
    }

    // ============ STATE VARIABLES ============

    // Token address => balance tracking
    mapping(address => TokenBalance) public tokenBalances;

    // Array of all tokens that have been deposited
    address[] public supportedTokens;
    mapping(address => bool) public isTokenSupported;

    // Authorized contracts that can deposit fees
    mapping(address => bool) public authorizedContracts;

    // Emergency withdrawal recipient
    address public emergencyRecipient;

    // ============ EVENTS ============

    event FeeReceived(
        address indexed token,
        address indexed from,
        uint256 amount,
        uint256 timestamp
    );

    event TokenWithdrawn(
        address indexed token,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event ContractAuthorized(address indexed contractAddress, bool authorized);
    event EmergencyRecipientUpdated(
        address indexed oldRecipient,
        address indexed newRecipient
    );
    event TokenAdded(address indexed token);

    // ============ MODIFIERS ============

    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || msg.sender == owner(),
            "Not authorized to deposit"
        );
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(address _emergencyRecipient) {
        require(
            _emergencyRecipient != address(0),
            "Invalid emergency recipient"
        );
        emergencyRecipient = _emergencyRecipient;
    }

    // ============ FEE MANAGEMENT ============

    /**
     * @dev Receive platform fees from authorized contracts
     * @param token Token address
     * @param amount Amount of tokens received
     */
    function receiveFees(
        address token,
        uint256 amount
    ) external onlyAuthorized nonReentrant whenNotPaused {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        // Transfer tokens to treasury
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        // Add token to supported list if not already present
        if (!isTokenSupported[token]) {
            supportedTokens.push(token);
            isTokenSupported[token] = true;
            emit TokenAdded(token);
        }

        // Update balance tracking
        tokenBalances[token].totalReceived += amount;
        tokenBalances[token].currentBalance += amount;

        emit FeeReceived(token, msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Direct deposit function for manual fee deposits
     * @param token Token address
     * @param amount Amount to deposit
     */
    function deposit(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        // Transfer tokens to treasury
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        // Add token to supported list if not already present
        if (!isTokenSupported[token]) {
            supportedTokens.push(token);
            isTokenSupported[token] = true;
            emit TokenAdded(token);
        }

        // Update balance tracking
        tokenBalances[token].totalReceived += amount;
        tokenBalances[token].currentBalance += amount;

        emit FeeReceived(token, msg.sender, amount, block.timestamp);
    }

    // ============ WITHDRAWAL FUNCTIONS ============

    /**
     * @dev Withdraw specific token to specified address
     * @param token Token address to withdraw
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        require(
            tokenBalances[token].currentBalance >= amount,
            "Insufficient balance"
        );

        // Update balance tracking
        tokenBalances[token].currentBalance -= amount;
        tokenBalances[token].totalWithdrawn += amount;

        // Transfer tokens
        require(IERC20(token).transfer(to, amount), "Token transfer failed");

        emit TokenWithdrawn(token, to, amount, block.timestamp);
    }

    /**
     * @dev Withdraw all tokens of a specific type
     * @param token Token address to withdraw
     * @param to Recipient address
     */
    function withdrawAllTokens(
        address token,
        address to
    ) external onlyOwner nonReentrant {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");

        uint256 balance = tokenBalances[token].currentBalance;
        require(balance > 0, "No balance to withdraw");

        // Update balance tracking
        tokenBalances[token].currentBalance = 0;
        tokenBalances[token].totalWithdrawn += balance;

        // Transfer tokens
        require(IERC20(token).transfer(to, balance), "Token transfer failed");

        emit TokenWithdrawn(token, to, balance, block.timestamp);
    }

    /**
     * @dev Withdraw multiple tokens at once
     * @param tokens Array of token addresses
     * @param to Recipient address
     */
    function withdrawMultipleTokens(
        address[] memory tokens,
        address to
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(tokens.length > 0, "No tokens specified");

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 balance = tokenBalances[token].currentBalance;

            if (balance > 0) {
                // Update balance tracking
                tokenBalances[token].currentBalance = 0;
                tokenBalances[token].totalWithdrawn += balance;

                // Transfer tokens
                require(
                    IERC20(token).transfer(to, balance),
                    "Token transfer failed"
                );

                emit TokenWithdrawn(token, to, balance, block.timestamp);
            }
        }
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Emergency withdrawal to predetermined address
     * @param token Token to withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");

        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");

        require(
            IERC20(token).transfer(emergencyRecipient, balance),
            "Emergency withdrawal failed"
        );

        emit TokenWithdrawn(
            token,
            emergencyRecipient,
            balance,
            block.timestamp
        );
    }

    /**
     * @dev Emergency withdrawal of all supported tokens
     */
    function emergencyWithdrawAll() external onlyOwner {
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));

            if (balance > 0) {
                require(
                    IERC20(token).transfer(emergencyRecipient, balance),
                    "Emergency withdrawal failed"
                );

                emit TokenWithdrawn(
                    token,
                    emergencyRecipient,
                    balance,
                    block.timestamp
                );
            }
        }
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Authorize contract to deposit fees
     * @param contractAddress Address of contract to authorize
     * @param authorized Whether contract is authorized
     */
    function setContractAuthorization(
        address contractAddress,
        bool authorized
    ) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        authorizedContracts[contractAddress] = authorized;
        emit ContractAuthorized(contractAddress, authorized);
    }

    /**
     * @dev Update emergency recipient
     * @param newRecipient New emergency recipient address
     */
    function updateEmergencyRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        address oldRecipient = emergencyRecipient;
        emergencyRecipient = newRecipient;
        emit EmergencyRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get current token balance
     * @param token Token address
     * @return Current balance in treasury
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return tokenBalances[token].currentBalance;
    }

    /**
     * @dev Get detailed token information
     * @param token Token address
     * @return TokenBalance struct with all balance info
     */
    function getTokenInfo(
        address token
    ) external view returns (TokenBalance memory) {
        return tokenBalances[token];
    }

    /**
     * @dev Get all supported tokens
     * @return Array of supported token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @dev Get actual token balance (from ERC20 contract)
     * @param token Token address
     * @return Actual balance held by this contract
     */
    function getActualTokenBalance(
        address token
    ) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Check if contract is authorized to deposit
     * @param contractAddress Contract address to check
     * @return Whether contract is authorized
     */
    function isContractAuthorized(
        address contractAddress
    ) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @dev Get total value locked (sum of all token balances)
     * @return tokens Array of token addresses
     * @return balances Array of corresponding token balances
     */
    function getTotalValueLocked()
        external
        view
        returns (address[] memory tokens, uint256[] memory balances)
    {
        tokens = new address[](supportedTokens.length);
        balances = new uint256[](supportedTokens.length);

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            tokens[i] = supportedTokens[i];
            balances[i] = tokenBalances[supportedTokens[i]].currentBalance;
        }
    }

    // ============ FALLBACK ============

    /**
     * @dev Receive function to handle direct ETH deposits
     */
    receive() external payable {
        // Handle native token deposits if needed
        revert("Direct ETH deposits not supported");
    }
}
