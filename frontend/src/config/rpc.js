// RPC Configuration for different networks

export const RPC_ENDPOINTS = {
    // Mantle Sepolia Testnet
    5003: [
        'https://rpc.sepolia.mantle.xyz',
        'https://mantle-sepolia.rpc.thirdweb.com',
    ],
    // Mantle Mainnet
    5000: [
        'https://rpc.mantle.xyz',
        'https://mantle.publicnode.com',
    ],
    // Local Hardhat/Foundry
    31337: [
        'http://127.0.0.1:8545',
        'http://localhost:8545',
    ]
};

/**
 * Get the primary RPC endpoint for a chain
 * @param {number} chainId - The chain ID
 * @returns {string} The RPC endpoint URL
 */
export function getPrimaryRPC(chainId) {
    const endpoints = RPC_ENDPOINTS[chainId];
    return endpoints && endpoints.length > 0 ? endpoints[0] : null;
}

/**
 * Get all RPC endpoints for a chain
 * @param {number} chainId - The chain ID
 * @returns {string[]} Array of RPC endpoint URLs
 */
export function getAllRPCs(chainId) {
    return RPC_ENDPOINTS[chainId] || [];
}

/**
 * Get a fallback RPC endpoint if the primary fails
 * @param {number} chainId - The chain ID
 * @param {number} index - The index of the fallback (0 = primary, 1 = first fallback, etc.)
 * @returns {string|null} The RPC endpoint URL or null
 */
export function getFallbackRPC(chainId, index = 1) {
    const endpoints = RPC_ENDPOINTS[chainId];
    if (!endpoints || index >= endpoints.length) return null;
    return endpoints[index];
}

/**
 * Test an RPC endpoint to see if it's responding
 * @param {string} rpcUrl - The RPC URL to test
 * @returns {Promise<boolean>} True if RPC is responsive
 */
export async function testRPC(rpcUrl) {
    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
            })
        });
        
        if (!response.ok) return false;
        
        const data = await response.json();
        return !!data.result;
    } catch (error) {
        console.error(`RPC test failed for ${rpcUrl}:`, error);
        return false;
    }
}
