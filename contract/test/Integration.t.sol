// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {BondFactory} from "../src/BondFactory.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";
import {RiskTierManager} from "../src/RiskTierManager.sol";
import {RevenueOracleConnector} from "../src/RevenueOracleConnector.sol";
import {InsurancePool} from "../src/InsurancePool.sol";
import {EscrowVault} from "../src/EscrowVault.sol";
import {SubscriptionRevenueToken} from "../src/SubscriptionRevenueToken.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Simple Mock Stablecoin
contract MockUSDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 1_000_000 * 1e6);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract IntegrationTest is Test {
    BondFactory factory;
    KYCRegistry kyc;
    RiskTierManager risk;
    RevenueOracleConnector oracle;
    InsurancePool insurance;
    MockUSDC stable;

    address admin = address(this);
    address business = address(0x1);
    address investor = address(0x2);
    address kycAdmin = address(0x3);
    address oracleUpdater = address(0x4);

    function setUp() public {
        // 1. Deploy Core Dependencies
        stable = new MockUSDC();
        kyc = new KYCRegistry();
        risk = new RiskTierManager();
        oracle = new RevenueOracleConnector();
        insurance = new InsurancePool(address(stable));

        // 2. Setup Permissions
        kyc.grantRole(kyc.KYC_ADMIN(), kycAdmin);
        oracle.grantRole(oracle.ORACLE(), oracleUpdater);

        // 3. Deploy Factory
        factory = new BondFactory(
            address(oracle),
            address(risk),
            address(kyc),
            address(stable),
            address(insurance)
        );

        // 4. Setup Test Data
        // Verify Business in Oracle
        vm.prank(oracleUpdater);
        // mrr: 100k, customers: 100, churn: 5% (500 basis points)
        oracle.update(business, 100_000 * 1e6, 100, 500); 

        // Verify Investor in KYC (Tier 1)
        vm.prank(kycAdmin);
        kyc.approve(investor, KYCRegistry.Tier.T1, true);

        // Mint stablecoin to investor
        stable.mint(investor, 50_000 * 1e6);
    }

    function test_CreateBondAndInvest() public {
        // 1. Create Bond (Amount 100k)
        vm.startPrank(admin);
        (address token, address vault) = factory.create(
            business,
            100_000 * 1e6, 
            8000, 8000, 8000, 8000
        );
        vm.stopPrank();

        assertTrue(token != address(0));
        assertTrue(vault != address(0));

        // 2. Investor invests (Funding Phase) - 10k
        vm.startPrank(investor);
        stable.approve(vault, 10_000 * 1e6);
        
        EscrowVault(vault).invest(10_000 * 1e6);
        vm.stopPrank();

        // 3. Check balances after Investment
        // Investor should have 10,000 Bond Tokens
        SubscriptionRevenueToken bondToken = SubscriptionRevenueToken(token);
        assertEq(bondToken.balanceOf(investor), 10_000 * 1e6); 

        // Business should have received the stablecoins
        assertEq(stable.balanceOf(business), 10_000 * 1e6);
        
        // 4. Test Revenue Distribution (Repayment Phase)
        // Business makes money and deposits it into Vault
        vm.startPrank(business);
        // Mint some revenue to business first
        stable.mint(business, 20_000 * 1e6); 
        
        stable.approve(vault, 1_000 * 1e6);
        EscrowVault(vault).deposit(1_000 * 1e6); // 1000 Revenue
        vm.stopPrank();
        
        // Check Distribution:
        // 80% (800) -> Investors Claimable
        // 15% (150) -> Business
        // 5% (50) -> Insurance
        
        assertEq(stable.balanceOf(address(insurance)), 50 * 1e6);
        
        // Investor claimable?
        uint256 claimable = bondToken.claimable(investor);
        assertEq(claimable, 800 * 1e6);
    }
}
