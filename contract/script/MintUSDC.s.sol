// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

interface IMockUSDC {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

contract MintUSDCScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address recipient = msg.sender;
        
        // Update this address with the deployed MockUSDC address
        address usdcAddress = 0xf9B2F4eCA69eEB7aA3B885d839D9985299A80535; // Mantle Sepolia
        
        IMockUSDC usdc = IMockUSDC(usdcAddress);
        
        console2.log("Minting USDC for address:", recipient);
        
        // Mint 100,000 USDC (100,000 * 10^6 due to 6 decimals)
        uint256 amount = 100_000 * 1e6;
        usdc.mint(recipient, amount);
        
        uint256 balance = usdc.balanceOf(recipient);
        console2.log("USDC minted successfully!");
        console2.log("New balance:", balance / 1e6, "USDC");

        vm.stopBroadcast();
    }
}
