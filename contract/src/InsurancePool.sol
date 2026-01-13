// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InsurancePool is AccessControl, ReentrancyGuard {
    IERC20 public immutable STABLE;
    
    uint256 public totalReserve;
    uint256 public totalClaims;
    
    mapping(address => uint256) public bondCoverage; // bond => max coverage
    mapping(address => bool) public hasClaimed;
    
    event Deposited(address indexed from, uint256 amount);
    event ClaimPaid(address indexed bond, uint256 amount);
    event CoverageSet(address indexed bond, uint256 maxCoverage);
    
    constructor(address _stable) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        STABLE = IERC20(_stable);
    }
    
    function deposit(uint256 amount) external nonReentrant {
        require(STABLE.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        totalReserve += amount;
        emit Deposited(msg.sender, amount);
    }
    
    function setCoverage(address bond, uint256 maxCoverage) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bondCoverage[bond] = maxCoverage;
        emit CoverageSet(bond, maxCoverage);
    }
    
    function claim(address bond, address recipient, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(!hasClaimed[bond], "Already claimed");
        require(amount <= bondCoverage[bond], "Exceeds coverage");
        require(amount <= totalReserve, "Insufficient reserve");
        
        hasClaimed[bond] = true;
        totalReserve -= amount;
        totalClaims += amount;
        
        require(STABLE.transfer(recipient, amount), "Claim transfer failed");
        emit ClaimPaid(bond, amount);
    }
    
    function getReserveRatio() external view returns (uint256) {
        if (totalReserve == 0) return 0;
        return (totalReserve * 10000) / (totalReserve + totalClaims);
    }
}
