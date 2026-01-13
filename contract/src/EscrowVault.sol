// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SubscriptionRevenueToken} from "./SubscriptionRevenueToken.sol";

interface IKYCRegistry {
    function businessVerified(address) external view returns (bool);
}

contract EscrowVault is AccessControl, ReentrancyGuard, Pausable {
    IERC20 public immutable STABLE;
    SubscriptionRevenueToken public immutable TOKEN;
    address public immutable BUSINESS;
    address public immutable INSURANCE;
    IKYCRegistry public immutable KYC;

    uint256 public constant I_SHARE = 80;  // 80% to investors
    uint256 public constant B_SHARE = 15;  // 15% to business
    uint256 public constant INS_SHARE = 5; // 5% to insurance

    uint256 public totalRaised;        // Total invested by investors
    uint256 public totalWithdrawn;     // Total withdrawn by business
    uint256 public totalDeposited;     // Total revenue deposited by business
    uint256 public totalDistributed;   // Total yield distributed to investors

    event Deposited(address indexed from, uint256 amount, uint256 toInvestors, uint256 toBusiness, uint256 toInsurance);
    event Invested(address indexed investor, uint256 amount);
    event Withdrawn(address indexed business, uint256 amount);

    constructor(address _stable, address _token, address _business, address _insurance, address _kyc) {
        require(_stable != address(0), "Invalid stable");
        require(_token != address(0), "Invalid token");
        require(_business != address(0), "Invalid business");
        require(_insurance != address(0), "Invalid insurance");
        require(_kyc != address(0), "Invalid KYC");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        STABLE = IERC20(_stable);
        TOKEN = SubscriptionRevenueToken(_token);
        BUSINESS = _business;
        INSURANCE = _insurance;
        KYC = IKYCRegistry(_kyc);
    }

    function invest(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount zero");
        require(msg.sender != BUSINESS, "Business cannot invest in own bond");
        
        // Transfer funds to vault (escrow), NOT directly to business
        require(STABLE.transferFrom(msg.sender, address(this), amount), "Transfer to vault failed");
        
        // Mint bond tokens to investor
        TOKEN.mint(msg.sender, amount);
        
        totalRaised += amount;
        
        emit Invested(msg.sender, amount);
    }

    /// @notice Business withdraws invested capital (KYC required)
    function withdraw() external nonReentrant whenNotPaused {
        require(msg.sender == BUSINESS, "Only business can withdraw");
        
        // Business must be KYC verified to withdraw funds
        require(KYC.businessVerified(BUSINESS), "Business must complete KYC to withdraw funds");
        
        uint256 available = totalRaised - totalWithdrawn;
        require(available > 0, "No funds to withdraw");
        
        totalWithdrawn += available;
        
        require(STABLE.transfer(BUSINESS, available), "Transfer to business failed");
        
        emit Withdrawn(BUSINESS, available);
    }

    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount zero");
        // Business deposits revenue
        require(STABLE.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 toInvestors = (amount * I_SHARE) / 100;
        uint256 toBusiness = (amount * B_SHARE) / 100;
        uint256 toIns = (amount * INS_SHARE) / 100;

        totalDeposited += amount;
        totalDistributed += toInvestors;

        TOKEN.distribute(toInvestors);
        
        // Return business share? This implies the business deposited 100, and gets 15 back.
        // This makes sense if 'amount' is Gross Revenue, and the contract calculates the split.
        require(STABLE.transfer(BUSINESS, toBusiness), "Business transfer failed");
        require(STABLE.transfer(INSURANCE, toIns), "Insurance transfer failed");

        emit Deposited(msg.sender, amount, toInvestors, toBusiness, toIns);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
