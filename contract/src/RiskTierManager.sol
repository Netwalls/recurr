// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RiskTierManager {
    enum RiskTier { NONE, D, C, B, A }

    struct RiskParameters {
        uint256 minRss;
        uint256 maxLtv;
        uint256 minApy;
        uint256 maxApy;
    }

    mapping(RiskTier => RiskParameters) public tierParameters;

    event TierParametersUpdated(RiskTier tier, uint256 minRss, uint256 maxLtv, uint256 minApy, uint256 maxApy);

    constructor() {
        tierParameters[RiskTier.A] = RiskParameters({minRss: 8000, maxLtv: 9000, minApy: 800, maxApy: 1200});
        tierParameters[RiskTier.B] = RiskParameters({minRss: 6000, maxLtv: 7000, minApy: 1500, maxApy: 2000});
        tierParameters[RiskTier.C] = RiskParameters({minRss: 4000, maxLtv: 5000, minApy: 2500, maxApy: 3500});
        tierParameters[RiskTier.D] = RiskParameters({minRss: 0, maxLtv: 3000, minApy: 4000, maxApy: 6000});
    }

    function calculateRss(uint256 g, uint256 r, uint256 c, uint256 s) external pure returns (uint256) {
        require(g <= 10000 && r <= 10000 && c <= 10000 && s <= 10000, "Invalid parameters");
        return (g * 30 + r * 30 + c * 20 + s * 20) / 100;
    }

    function getRiskTier(uint256 rss) external pure returns (RiskTier) {
        if (rss >= 8000) return RiskTier.A;
        if (rss >= 6000) return RiskTier.B;
        if (rss >= 4000) return RiskTier.C;
        return RiskTier.D;
    }

    function calculateMaxLoan(uint256 revenue, RiskTier t) external view returns (uint256) {
        require(t != RiskTier.NONE, "Invalid tier");
        return (revenue * tierParameters[t].maxLtv) / 10000;
    }

    function getTierParameters(RiskTier t) external view returns (RiskParameters memory) {
        return tierParameters[t];
    }
}
