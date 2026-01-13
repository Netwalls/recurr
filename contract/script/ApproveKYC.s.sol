// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract ApproveKYCScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address deployer = msg.sender;
        
        // Update this address with the deployed KYCRegistry address
        address kycAddress = 0x723402E7abbe692f9d6A4586bF0ac7C7edd06e17; // Mantle Sepolia
        
        KYCRegistry kyc = KYCRegistry(kycAddress);
        
        console2.log("Approving KYC for address:", deployer);
        
        // Approve with Tier T2 (institutional - $100K limit) and accredited status
        kyc.approve(deployer, KYCRegistry.Tier.T2, true);
        
        console2.log("KYC approved successfully!");
        console2.log("Tier: T2 (Institutional)");
        console2.log("Max Investment: $100,000");
        console2.log("Accredited: Yes");

        vm.stopBroadcast();
    }
}
