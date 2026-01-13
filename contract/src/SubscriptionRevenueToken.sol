// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RiskTierManager} from "./RiskTierManager.sol";

interface IKYCRegistry {
    function isApproved(address) external view returns (bool);
    function canInvest(address, uint256) external view returns (bool);
}

contract SubscriptionRevenueToken is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER = keccak256("MINTER_ROLE");

    struct Terms {
        address business;
        uint256 principal;
        uint256 totalRepay;
        uint256 monthly;
        uint256 start;
        uint256 maturity;
        uint256 apr;
        RiskTierManager.RiskTier tier;
        bool active;
    }

    Terms public terms;
    IKYCRegistry public immutable KYC;

    uint256 public distributed;
    mapping(address => uint256) public claimed;

    event Revenue(uint256 amount);
    event Claimed(address indexed holder, uint256 amount);
    event Matured();

    constructor(
        string memory name_,
        string memory symbol_,
        Terms memory _terms,
        address _kyc
    ) ERC20(name_, symbol_) {
        require(_terms.business != address(0), "Invalid business");
        require(_terms.principal > 0, "Invalid principal");
        require(_kyc != address(0), "Invalid KYC");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER, msg.sender);

        terms = _terms;
        KYC = IKYCRegistry(_kyc);
    }

    /// @notice ERC20 hook: enforce pause only (no KYC for investors)
    function _update(address from, address to, uint256 amount) internal override {
        require(!paused(), "Token is paused");
        // No KYC check - investors can freely trade
        super._update(from, to, amount);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER) {
        require(terms.active, "Bond inactive");
        require(totalSupply() + amount <= terms.principal, "Exceeds principal");
        // No KYC check for investors - open to all
        
        _mint(to, amount);
    }

    function distribute(uint256 amount) external onlyRole(MINTER) {
        require(terms.active, "Bond inactive");
        require(amount > 0, "Amount zero");

        distributed += amount;
        emit Revenue(amount);

        if (distributed >= terms.totalRepay || block.timestamp >= terms.maturity) {
            terms.active = false;
            emit Matured();
        }
    }

    function claimable(address holder) public view returns (uint256) {
        uint256 bal = balanceOf(holder);
        if (bal == 0 || totalSupply() == 0) return 0;
        
        uint256 totalClaimable = (distributed * bal) / totalSupply();
        return totalClaimable - claimed[holder];
    }

    function claim() external nonReentrant {
        uint256 amount = claimable(msg.sender);
        require(amount > 0, "Nothing to claim");
        
        claimed[msg.sender] += amount;
        emit Claimed(msg.sender, amount);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
