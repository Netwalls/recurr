// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract VerifyBusinessScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address business = msg.sender;
        
        // Update this address with the deployed KYCRegistry address
        address kycAddress = 0xF884DD00A433B37457F9EaBabB79253f5e64C7F5; // Mantle Sepolia
        
        KYCRegistry kyc = KYCRegistry(kycAddress);
        
        console2.log("Verifying business address:", business);
        
        // Verify the business
        kyc.verifyBusiness(business, true);
        
        console2.log("Business KYC verified successfully!");
        console2.log("This business can now receive investments");

        vm.stopBroadcast();
    }
}
