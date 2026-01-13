// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract KYCRegistry is AccessControl {
    bytes32 public constant KYC_ADMIN = keccak256("KYC_ADMIN");

    enum Tier { NONE, T1, T2, T3 }

    struct Data {
        Tier tier;
        uint256 maxInvest;
        bool accredited;
        uint256 approvedAt;
    }

    mapping(address => Data) public status;
    mapping(address => bool) public businessVerified;

    event Approved(address indexed user, Tier tier, bool accredited);
    event Revoked(address indexed user);
    event BusinessVerified(address indexed business, bool status);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KYC_ADMIN, msg.sender);
    }

    function approve(address user, Tier tier, bool accredited) external onlyRole(KYC_ADMIN) {
        require(user != address(0), "Invalid address");
        require(tier != Tier.NONE, "Invalid tier");
        
        uint256 maxInvest = tier == Tier.T1 ? 10_000 * 1e6  // $10K for retail
                          : tier == Tier.T2 ? 100_000 * 1e6  // $100K for institutional
                          : type(uint256).max;               // Unlimited for T3

        status[user] = Data({
            tier: tier,
            maxInvest: maxInvest,
            accredited: accredited,
            approvedAt: block.timestamp
        });
        emit Approved(user, tier, accredited);
    }

    function revoke(address user) external onlyRole(KYC_ADMIN) {
        delete status[user];
        emit Revoked(user);
    }

    function verifyBusiness(address business, bool verified) external onlyRole(KYC_ADMIN) {
        businessVerified[business] = verified;
        emit BusinessVerified(business, verified);
    }

    function isApproved(address user) external view returns (bool) {
        return status[user].tier != Tier.NONE;
    }

    function canInvest(address user, uint256 amount) external view returns (bool) {
        Data memory d = status[user];
        return d.tier != Tier.NONE && amount <= d.maxInvest;
    }
}
