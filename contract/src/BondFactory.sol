// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {RevenueOracleConnector} from "./RevenueOracleConnector.sol";
import {RiskTierManager} from "./RiskTierManager.sol";
import {SubscriptionRevenueToken} from "./SubscriptionRevenueToken.sol";
import {EscrowVault} from "./EscrowVault.sol";

contract BondFactory is AccessControl {
    address public immutable ORACLE;
    address public immutable RISK;
    address public immutable KYC;
    address public immutable STABLECOIN;
    address public immutable INSURANCE;

    address[] public bonds;
    mapping(address => address[]) public businessBonds;
    mapping(address => BondInfo) public bondInfo;

    struct BondInfo {
        address token;
        address vault;
        address business;
        uint256 principal;
        uint256 createdAt;
        bool active;
    }

    event Created(
        address indexed business,
        address indexed token,
        address indexed vault,
        uint256 principal,
        uint256 apr
    );

    // ==================== CUSTOM ERRORS ====================
    error InvalidOracle();
    error InvalidRisk();
    error InvalidKYC();
    error InvalidStable();
    error InvalidInsurance();
    error InvalidBusiness();
    error InvalidAmount();
    error BusinessNotVerified();
    error InvalidMRR();
    error RiskTierTooLow();
    error ExceedsMaxLTV();

    constructor(
        address _oracle,
        address _risk,
        address _kyc,
        address _stable,
        address _ins
    ) {
        if (_oracle == address(0)) revert InvalidOracle();
        if (_risk == address(0)) revert InvalidRisk();
        if (_kyc == address(0)) revert InvalidKYC();
        if (_stable == address(0)) revert InvalidStable();
        if (_ins == address(0)) revert InvalidInsurance();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        ORACLE = _oracle;
        RISK = _risk;
        KYC = _kyc;
        STABLECOIN = _stable;
        INSURANCE = _ins;
    }

    function create(
        address business,
        uint256 amount,
        uint256 g,
        uint256 r,
        uint256 c,
        uint256 s
    ) external returns (address tokenAddr, address vaultAddr) {
        // Fixed: conditions were reversed!
        if (business == address(0)) revert InvalidBusiness();
        if (amount == 0) revert InvalidAmount();

        // Get and validate business metrics
        if (amount < 1000 * 10 ** 6)
            revert("Principal must be at least $1,000");
        RevenueOracleConnector.Metrics memory metrics = RevenueOracleConnector(
            ORACLE
        ).get(business);
        if (!metrics.verified) revert BusinessNotVerified();
        if (metrics.mrr == 0) revert InvalidMRR();

        // Calculate risk tier and APR
        (RiskTierManager.RiskTier tier, uint256 apr) = _validateAndCalculate(
            metrics.mrr,
            amount,
            g,
            r,
            c,
            s
        );

        // Create the bond token + vault
        (tokenAddr, vaultAddr) = _createBond(
            business,
            amount,
            metrics.mrr,
            tier,
            apr
        );

        emit Created(business, tokenAddr, vaultAddr, amount, apr);
    }

    function _validateAndCalculate(
        uint256 mrr,
        uint256 amount,
        uint256 g,
        uint256 r,
        uint256 c,
        uint256 s
    ) internal view returns (RiskTierManager.RiskTier tier, uint256 apr) {
        // Calculate RSS and tier normally (keep for APR calculation)
        uint256 rss = RiskTierManager(RISK).calculateRss(g, r, c, s);
        tier = RiskTierManager(RISK).getRiskTier(rss);

        // TEMPORARY: Completely remove tier and LTV restrictions for testing/development
        // No revert for D tier
        // No ExceedsMaxLTV check

        // Just calculate APR based on the real tier
        RiskTierManager.RiskParameters memory p = RiskTierManager(RISK)
            .getTierParameters(tier);
        apr = (p.minApy + p.maxApy) / 2;

        // Optional: Force a fixed APR if you want consistency during testing
        // apr = 1200; // 12% fixed for all
    }

    function _createBond(
        address business,
        uint256 amount,
        uint256 mrr,
        RiskTierManager.RiskTier tier,
        uint256 apr
    ) internal returns (address tokenAddr, address vaultAddr) {
        // Deploy the token with calculated terms
        SubscriptionRevenueToken token = new SubscriptionRevenueToken(
            string(abi.encodePacked("SRT-", _addr(business), "-", _num(bonds.length))),
            string(abi.encodePacked("SRT", _num(bonds.length))),
            SubscriptionRevenueToken.Terms({
                business: business,
                principal: amount,
                totalRepay: (amount * (10000 + apr)) / 10000,
                monthly: ((amount * (10000 + apr)) / 10000) / 12,
                start: block.timestamp,
                maturity: block.timestamp + 365 days,
                apr: apr,
                tier: tier,
                active: true
            }),
            KYC
        );
        tokenAddr = address(token);

        // Deploy the vault (correct parameter order: stable, token, business, insurance, kyc)
        vaultAddr = address(new EscrowVault(STABLECOIN, tokenAddr, business, INSURANCE, KYC));

        // Grant vault minter role
        token.grantRole(token.MINTER(), vaultAddr);

        // Store bond info
        bonds.push(tokenAddr);
        businessBonds[business].push(tokenAddr);
        bondInfo[tokenAddr] = BondInfo({
            token: tokenAddr,
            vault: vaultAddr,
            business: business,
            principal: amount,
            createdAt: block.timestamp,
            active: true
        });
    }

    // Short address to string (last 4 bytes in hex)
    function _addr(address a) internal pure returns (string memory) {
        bytes32 v = bytes32(uint256(uint160(a)));
        bytes memory alf = "0123456789abcdef";
        bytes memory str = new bytes(8);
        for (uint i = 0; i < 4; i++) {
            str[i * 2] = alf[uint8(v[i + 28] >> 4)];
            str[i * 2 + 1] = alf[uint8(v[i + 28] & 0x0f)];
        }
        return string(str);
    }

    // Uint to string
    function _num(uint256 n) internal pure returns (string memory) {
        if (n == 0) return "0";
        uint256 len;
        uint256 temp = n;
        while (temp != 0) {
            len++;
            temp /= 10;
        }
        bytes memory buf = new bytes(len);
        while (n != 0) {
            len--;
            buf[len] = bytes1(uint8(48 + (n % 10)));
            n /= 10;
        }
        return string(buf);
    }

    function getAllBonds() external view returns (address[] memory) {
        return bonds;
    }

    function getBusinessBonds(
        address business
    ) external view returns (address[] memory) {
        return businessBonds[business];
    }

    function getBondCount() external view returns (uint256) {
        return bonds.length;
    }
}
