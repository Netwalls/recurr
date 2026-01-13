// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract RevenueOracleConnector is AccessControl {
    bytes32 public constant ORACLE = keccak256("ORACLE");

    struct Metrics {
        uint256 mrr;
        uint256 customers;
        uint256 churn;
        uint256 ts;
        bool verified;
    }

    mapping(address => Metrics) public metrics;
    mapping(address => Metrics[]) public metricsHistory;

    event Updated(
        address indexed business,
        uint256 mrr,
        uint256 customers,
        uint256 churn
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE, msg.sender);
    }

    function update(
        address business,
        uint256 mrr,
        uint256 customers,
        uint256 churn
    ) external {
        require(business != address(0), "Invalid business");
        require(mrr > 0, "MRR must be > 0");
        require(churn <= 10000, "Churn cannot exceed 100%");
        require(customers > 0, "Must have customers");

        Metrics memory newMetrics = Metrics({
            mrr: mrr,
            customers: customers,
            churn: churn,
            ts: block.timestamp,
            verified: true
        });

        // Store in history
        metricsHistory[business].push(newMetrics);

        // Update current
        metrics[business] = newMetrics;

        emit Updated(business, mrr, customers, churn);
    }

    function get(address business) external view returns (Metrics memory) {
        require(metrics[business].verified, "Business not verified");
        require(
            block.timestamp - metrics[business].ts <= 31 days,
            "Data too old"
        );
        return metrics[business];
    }

    function getHistory(
        address business
    ) external view returns (Metrics[] memory) {
        return metricsHistory[business];
    }
}
