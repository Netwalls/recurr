// Chain IDs
export const MANTLE_SEPOLIA_CHAIN_ID = 5003;
export const LOCAL_CHAIN_ID = 31337;

// Contract addresses per chain
const MANTLE_SEPOLIA_ADDRESSES = {
    MockUSDC: '0xf9B2F4eCA69eEB7aA3B885d839D9985299A80535',
    RevenueOracleConnector: '0x15dAcCFA99d50A0c71eE93552318400eFCc09BAB',
    RiskTierManager: '0xaDb76Cf8F935814095D2bDe7E83139d62907752e',
    KYCRegistry: '0xF884DD00A433B37457F9EaBabB79253f5e64C7F5',
    InsurancePool: '0x5965fcaf415dB7A350FA736E8bD8c135eb6905b7',
    BondFactory: '0x27A95ACcD4D98575D30C7B9a886d95901bACB974',
};

// Localhost addresses (update after local deployment)
const LOCAL_ADDRESSES = {
    MockUSDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    RevenueOracleConnector: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    RiskTierManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    KYCRegistry: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    InsurancePool: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    BondFactory: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
};

export function getContractAddresses(chainId) {
    const id = Number(chainId);
    if (id === MANTLE_SEPOLIA_CHAIN_ID || id === 5000) {
        return MANTLE_SEPOLIA_ADDRESSES;
    }
    return LOCAL_ADDRESSES;
}
// ===================== ABIS =====================

export const REVENUE_ORACLE_ABI = [
    // Read functions
    'function get(address business) external view returns (tuple(uint256 mrr, uint256 customers, uint256 churn, uint256 ts, bool verified))',
    'function metrics(address) external view returns (uint256 mrr, uint256 customers, uint256 churn, uint256 ts, bool verified)',
    'function getHistory(address business) external view returns (tuple(uint256 mrr, uint256 customers, uint256 churn, uint256 ts, bool verified)[])',
    // Write functions
    'function update(address business, uint256 mrr, uint256 customers, uint256 churn) external',
    // Events
    'event Updated(address indexed business, uint256 mrr, uint256 customers, uint256 churn)',
];

export const BOND_FACTORY_ABI = [
    // Read functions
    'function bonds(uint256) external view returns (address)',
    'function getAllBonds() external view returns (address[])',
    'function getBusinessBonds(address business) external view returns (address[])',
    'function getBondCount() external view returns (uint256)',
    'function bondInfo(address token) external view returns (address token, address vault, address business, uint256 principal, uint256 createdAt, bool active)',
    // Write functions
    'function create(address business, uint256 amount, uint256 g, uint256 r, uint256 c, uint256 s) external returns (address tokenAddr, address vaultAddr)',
    // Events
    'event Created(address indexed business, address indexed token, address indexed vault, uint256 principal, uint256 apr)',
];

export const SUBSCRIPTION_REVENUE_TOKEN_ABI = [
    // ERC20 standard
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)',
    'function totalSupply() external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    // Bond-specific
    'function terms() external view returns (address business, uint256 principal, uint256 totalRepay, uint256 monthly, uint256 start, uint256 maturity, uint256 apr, uint8 tier, bool active)',
    'function claimableYield(address holder) external view returns (uint256)',
    'function claim() external',
    'function fund(uint256 amount) external',
    // Events
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event YieldClaimed(address indexed holder, uint256 amount)',
];

export const ESCROW_VAULT_ABI = [
    // Read functions
    'function STABLE() external view returns (address)',
    'function TOKEN() external view returns (address)',
    'function BUSINESS() external view returns (address)',
    'function INSURANCE() external view returns (address)',
    'function totalRaised() external view returns (uint256)',
    'function totalWithdrawn() external view returns (uint256)',
    'function totalDeposited() external view returns (uint256)',
    'function totalDistributed() external view returns (uint256)',
    // Write functions
    'function invest(uint256 amount) external',
    'function withdraw() external',
    'function deposit(uint256 amount) external',
    // Events
    'event Invested(address indexed investor, uint256 amount)',
    'event Withdrawn(address indexed business, uint256 amount)',
    'event Deposited(address indexed from, uint256 amount, uint256 toInvestors, uint256 toBusiness, uint256 toInsurance)',
];

export const KYC_REGISTRY_ABI = [
    'function isApproved(address account) external view returns (bool)',
    'function canInvest(address user, uint256 amount) external view returns (bool)',
    'function status(address) external view returns (uint8 tier, uint256 maxInvest, bool accredited, uint256 approvedAt)',
    'function businessVerified(address) external view returns (bool)',
    'function approve(address user, uint8 tier, bool accredited) external',
    'function revoke(address user) external',
    'function verifyBusiness(address business, bool verified) external',
    'event Approved(address indexed user, uint8 tier, bool accredited)',
    'event Revoked(address indexed user)',
    'event BusinessVerified(address indexed business, bool status)',
];

export const INSURANCE_POOL_ABI = [
    'function STABLE() external view returns (address)',
    'function totalReserves() external view returns (uint256)',
    'function totalClaims() external view returns (uint256)',
    'function coverageRatio() external view returns (uint256)',
    'function deposit(uint256 amount) external',
    'function claim(address business, address recipient, uint256 amount) external',
    'event Deposited(address indexed depositor, uint256 amount)',
    'event ClaimPaid(address indexed recipient, uint256 amount)',
];

export const MOCK_USDC_ABI = [
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)',
    'function totalSupply() external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function mint(address to, uint256 amount) external',
];
