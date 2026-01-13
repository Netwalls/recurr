// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {BondFactory} from "../src/BondFactory.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";
import {RiskTierManager} from "../src/RiskTierManager.sol";
import {RevenueOracleConnector} from "../src/RevenueOracleConnector.sol";
import {InsurancePool} from "../src/InsurancePool.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 1_000_000_000 * 1e6); // 1 Billion USDC
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // Use the broadcaster configured via CLI (--private-key or --keystore or --sender)
        vm.startBroadcast();

        address deployer = msg.sender;

        console2.log("Deploying contracts with address:", deployer);

        // 1. Deploy Mock USDC (For Testnet/Dev only)
        // In prod, this would be the real USDC address on Mantle
        MockUSDC usdc = new MockUSDC();
        console2.log("MockUSDC deployed at:", address(usdc));

        // 2. Deploy Core Systems
        RevenueOracleConnector oracle = new RevenueOracleConnector();
        console2.log("RevenueOracleConnector deployed at:", address(oracle));

        RiskTierManager risk = new RiskTierManager();
        console2.log("RiskTierManager deployed at:", address(risk));

        KYCRegistry kyc = new KYCRegistry();
        console2.log("KYCRegistry deployed at:", address(kyc));

        InsurancePool insurance = new InsurancePool(address(usdc));
        console2.log("InsurancePool deployed at:", address(insurance));

        // 3. Deploy Factory
        BondFactory factory = new BondFactory(
            address(oracle),
            address(risk),
            address(kyc),
            address(usdc),
            address(insurance)
        );
        console2.log("BondFactory deployed at:", address(factory));

        // 4. Setup Initial Permissions / Data (Optional for dev convenience)

        // Grant Oracle access to deployer for testing
        oracle.grantRole(oracle.ORACLE(), deployer);

        // Grant KYC admin to deployer
        kyc.grantRole(kyc.KYC_ADMIN(), deployer);

        vm.stopBroadcast();
    }
}
