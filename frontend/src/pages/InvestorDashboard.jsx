import { useState, useEffect } from 'react';
import { Loader, TrendingUp, ShieldCheck } from 'lucide-react';
import { ethers } from 'ethers';
import { getContractAddresses, BOND_FACTORY_ABI, MOCK_USDC_ABI, ESCROW_VAULT_ABI, SUBSCRIPTION_REVENUE_TOKEN_ABI, REVENUE_ORACLE_ABI, KYC_REGISTRY_ABI } from '../config/contracts';

export default function InvestorDashboard({ account, provider, chainId }) {
    const CONTRACT_ADDRESSES = getContractAddresses(chainId);
    const [bonds, setBonds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [amount, setAmount] = useState("1000");

    const fetchBonds = async () => {
        if (!provider) return;
        setLoading(true);
        try {
            const factory = new ethers.Contract(CONTRACT_ADDRESSES.BondFactory, BOND_FACTORY_ABI, provider);
            const oracle = new ethers.Contract(CONTRACT_ADDRESSES.RevenueOracleConnector, REVENUE_ORACLE_ABI, provider);
            const allBonds = await factory.getAllBonds();

            const bondDetails = await Promise.all(allBonds.map(async (addr) => {
                try {
                    const info = await factory.bondInfo(addr);
                    const tokenContract = new ethers.Contract(info.token, SUBSCRIPTION_REVENUE_TOKEN_ABI, provider);
                    const terms = await tokenContract.terms();
                    const name = await tokenContract.name();

                    let score = "N/A";
                    let verifiedMrr = "0";
                    try {
                        const metrics = await oracle.get(terms.business);
                        // MRR is stored in USDC 6-decimal format, convert to USD
                        verifiedMrr = ethers.formatUnits(metrics.mrr, 6);
                        const tiers = ["NONE", "D", "C", "B", "A"];
                        const tierName = tiers[Number(terms.tier)] || "C";
                        score = tierName === "A" ? "0.92" : (tierName === "B" ? "0.75" : "0.50");
                    } catch (e) { }

                    let filled = "0";
                    try {
                        const totalSupply = await tokenContract.totalSupply();
                        filled = ethers.formatUnits(totalSupply, 6);
                    } catch (e) { }

                    return {
                        address: info.token,
                        vault: info.vault,
                        name: name,
                        principal: ethers.formatUnits(info.principal, 6),
                        filled: filled,
                        apy: Number(terms.apr),
                        tier: terms.tier,
                        term: "12 Mo",
                        score: score,
                        mrr: verifiedMrr
                    };
                } catch (innerErr) { return null; }
            }));
            setBonds(bondDetails.filter(b => b !== null));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBonds(); }, [provider]);

    const handleInvest = async (bond, amt) => {
        if (!account) return alert("Connect Wallet");
        setProcessing(true);
        try {
            const signer = await provider.getSigner();
            const usdc = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, MOCK_USDC_ABI, signer);
            const vault = new ethers.Contract(bond.vault, ESCROW_VAULT_ABI, signer);
            const investAmount = ethers.parseUnits(amt, 6);

            // Approve USDC transfer
            const tx1 = await usdc.approve(bond.vault, investAmount);
            await tx1.wait();

            // Invest
            const tx2 = await vault.invest(investAmount);
            await tx2.wait();

            alert("✅ Investment Successful!");
            fetchBonds();
        } catch (err) {
            console.error(err);
            let message = "Investment failed";
            if (err.message.includes("Business not KYC verified")) {
                message = "Business is not KYC verified. They must complete verification before accepting investments.";
            } else if (err.message.includes("insufficient allowance")) {
                message = "Approval failed. Please try again.";
            } else if (err.message.includes("insufficient funds")) {
                message = "Insufficient USDC balance. You need test USDC to invest.";
            }
            alert(message + "\n\nDetails: " + (err.reason || err.message));
        } finally { setProcessing(false); }
    };

    return (
        <div className="container page-wrapper">
            <header style={{ marginBottom: '3rem' }}>
                <h1>Marketplace</h1>
                <p className="text-muted">Institutional-grade recurring revenue bonds.</p>
            </header>

            {loading ? <div className="fintech-card" style={{ padding: '3rem', textAlign: 'center' }}><Loader className="spin" /></div> : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Header Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', gap: '1rem', padding: '0 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        <div>Asset</div>
                        <div>APY</div>
                        <div>Stability Score</div>
                        <div>Liquidity</div>
                        <div>Action</div>
                    </div>

                    {bonds.length === 0 ? <p className="text-muted" style={{ padding: '0 1.5rem' }}>No active markets.</p> :
                        bonds.map((bond, idx) => (
                            <div key={idx} className="fintech-card" style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
                                gap: '1rem',
                                alignItems: 'center',
                                padding: '1.5rem' // Override default if needed
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{bond.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginTop: 4 }}>
                                        <ShieldCheck size={14} style={{ marginRight: 4, color: 'var(--primary)' }} />
                                        Verified MRR: ${Number(bond.mrr).toLocaleString()}
                                    </div>
                                </div>

                                <div className="text-highlight" style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                                    {(bond.apy / 100).toFixed(2)}%
                                </div>

                                <div>
                                    <div style={{ fontSize: '1.1rem' }}>{bond.score}</div>
                                    <span className="badge badge-gold" style={{ marginLeft: 0, marginTop: 4 }}>Tier {["-", "D", "C", "B", "A"][bond.tier]}</span>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.9rem' }}>{Math.round((bond.filled / bond.principal) * 100)}% Filled</div>
                                    <div style={{ width: '80%', background: '#333', height: 4, marginTop: 8, borderRadius: 2 }}>
                                        <div style={{ width: `${(bond.filled / bond.principal) * 100}%`, background: 'var(--primary)', height: '100%' }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        placeholder="1000"
                                        style={{ width: '100px', padding: '0.5rem' }}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <button className="btn-primary"
                                        style={{ padding: '0.5rem 1rem' }}
                                        disabled={processing}
                                        onClick={() => handleInvest(bond, amount || "1000")}
                                    >
                                        {processing ? <Loader size={16} className="spin" /> : "Invest"}
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
