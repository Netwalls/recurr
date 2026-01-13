import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle, TrendingUp, AlertCircle, Loader, Upload, FileText, Terminal, XCircle, DollarSign, Wallet } from 'lucide-react';
import { ethers } from 'ethers';
import { getContractAddresses, BOND_FACTORY_ABI, REVENUE_ORACLE_ABI, ESCROW_VAULT_ABI, KYC_REGISTRY_ABI } from '../config/contracts';

export default function BusinessDashboard({ account, provider, chainId }) {
    const navigate = useNavigate();
    const CONTRACT_ADDRESSES = getContractAddresses(chainId);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [bondMinted, setBondMinted] = useState(false);
    const [myBonds, setMyBonds] = useState([]);
    const [bondDetails, setBondDetails] = useState(null); // { vault, totalRaised, totalWithdrawn, isKYCVerified }

    const [analysisStatus, setAnalysisStatus] = useState("idle");
    const [statusMsg, setStatusMsg] = useState("");
    const [extractionLogs, setExtractionLogs] = useState([]);
    const [extractedText, setExtractedText] = useState("");
    const logsEndRef = useRef(null);

    const [businessData, setBusinessData] = useState({
        mrr: 0,
        customers: 0,
        growth: "0%",
        score: 0,
        tier: "-",
        maxLoan: 0,
        apy: "-",
        metrics: { g: 0, r: 0, c: 0, s: 0 },
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
    });

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [extractionLogs]);

    const parseMoney = (str) => {
        const cleaned = str.replace(/[₦#$\s,]/g, '');
        return parseFloat(cleaned) || 0;
    };

    const fetchMyBonds = async () => {
        if (!provider || !account) return;
        try {
            const factory = new ethers.Contract(CONTRACT_ADDRESSES.BondFactory, BOND_FACTORY_ABI, provider);
            const kyc = new ethers.Contract(CONTRACT_ADDRESSES.KYCRegistry, KYC_REGISTRY_ABI, provider);
            const bondAddrs = await factory.getBusinessBonds(account);
            setMyBonds(bondAddrs);
            if (bondAddrs.length > 0) {
                setBondMinted(true);
                setConnected(true); // User already has a bond; show dashboard

                // Get details for the first bond
                const bondInfo = await factory.bondInfo(bondAddrs[0]);
                const vault = new ethers.Contract(bondInfo.vault, ESCROW_VAULT_ABI, provider);

                const totalRaised = await vault.totalRaised();
                const totalWithdrawn = await vault.totalWithdrawn();
                const isKYCVerified = await kyc.businessVerified(account);

                setBondDetails({
                    vault: bondInfo.vault,
                    totalRaised: ethers.formatUnits(totalRaised, 6),
                    totalWithdrawn: ethers.formatUnits(totalWithdrawn, 6),
                    available: ethers.formatUnits(totalRaised - totalWithdrawn, 6),
                    isKYCVerified
                });
            }
        } catch (err) {
            console.error("Error fetching bonds:", err);
        }
    };

    const checkOracleStatus = async () => {
        if (!provider || !account) {
            setConnected(false);
            return;
        }
        try {
            const oracle = new ethers.Contract(CONTRACT_ADDRESSES.RevenueOracleConnector, REVENUE_ORACLE_ABI, provider);
            const data = await oracle.get(account);
            console.log("Oracle data:", data);

            if (data.verified) {
                setConnected(true);
                const mrrNum = Number(data.mrr) / 1_000_000;
                const custNum = Number(data.customers);

                // Calculate actual metrics from oracle data
                const derivedScore = Math.min(0.99, (custNum * 10) / 1000 + (mrrNum / 100000)).toFixed(2);
                const scoreNum = parseFloat(derivedScore);

                // Calculate tier based on actual score
                let tier = "D";
                if (scoreNum >= 0.8) tier = "A";
                else if (scoreNum >= 0.6) tier = "B";
                else if (scoreNum >= 0.4) tier = "C";

                // Calculate max loan as 3x MRR (standard SaaS lending multiple)
                const maxLoan = mrrNum * 3;

                // Calculate APY based on tier (better score = lower APY)
                const apy = tier === "A" ? "8%" : tier === "B" ? "10%" : tier === "C" ? "12%" : "15%";

                // Calculate metrics from actual score (0-1000 scale)
                const metricBase = Math.floor(scoreNum * 10000);

                setBusinessData(prev => ({
                    ...prev,
                    mrr: mrrNum,
                    customers: custNum,
                    growth: "N/A", // Will be calculated from historical data later
                    score: derivedScore,
                    tier: tier,
                    maxLoan: maxLoan,
                    apy: apy,
                    metrics: {
                        g: metricBase, // Growth metric
                        r: metricBase, // Revenue metric
                        c: metricBase, // Customer metric
                        s: metricBase  // Stability metric
                    },
                    totalBalance: prev.totalBalance || 0, // Preserve if already set
                    totalDeposits: prev.totalDeposits || 0,
                    totalWithdrawals: prev.totalWithdrawals || 0
                }));
            } else {
                setConnected(false);
            }
        } catch (err) {
            console.error("Error checking oracle status:", err);
            setConnected(false);
        }
    };

    useEffect(() => {
        fetchMyBonds();
        checkOracleStatus();
    }, [provider, account]);

    const loadPDFLib = () => {
        return new Promise((resolve, reject) => {
            if (window.pdfjsLib) return resolve(window.pdfjsLib);
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(window.pdfjsLib);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const addLog = (msg) => {
        setExtractionLogs(prev => [...prev, `> ${msg}`]);
    };

    // Your existing parseCSVFormat and parseTextAnalysis functions remain unchanged
    // ... (I omitted them here to save space, but keep them as-is)

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setAnalysisStatus("processing");
        setStatusMsg("Reading file...");
        setExtractedText("");
        setExtractionLogs([]);

        try {
            addLog(`Initiating File Scan: ${file.name}`);
            let text = "";

            if (file.type === "application/pdf") {
                addLog("> File Type: PDF detected. Loading PDF.js...");
                const pdfLib = await loadPDFLib();
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfLib.getDocument({ data: arrayBuffer }).promise;
                addLog(`> PDF loaded. Pages: ${pdf.numPages}`);

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ') + '\n';
                }
            } else {
                addLog("> File Type: CSV/Text detected.");
                text = await file.text();
            }

            setExtractedText(text);
            const lines = text.split('\n').filter(l => l.trim());
            addLog(`> Analyzing ${lines.length} lines...`);

            // Parse the file content
            const results = parseFileContent(lines);

            if (!results || results.totalDeposits <= 0) {
                addLog("ERROR: Could not extract valid revenue data from file.");
                setAnalysisStatus("error");
                setStatusMsg("No revenue data found");
                setLoading(false);
                return;
            }

            const netFlow = results.totalDeposits - results.totalWithdrawals;
            const g = Math.min(10000, (netFlow / (results.totalDeposits || 1)) * 10000);
            const r = Math.min(10000, (1 - (results.totalWithdrawals / (results.totalDeposits || 1))) * 10000);
            const c = Math.min(10000, ((results.totalBalance / (results.totalDeposits || 1))) * 10000);
            const s = Math.min(10000, results.txCount * 100);
            const uiScore = ((g + r + c + s) / 40000).toFixed(2);

            const tier = uiScore > 0.8 ? "A" : (uiScore > 0.6 ? "B" : "C");
            const apy = tier === "A" ? "12%" : (tier === "B" ? "15%" : "18%");

            const analyzedData = {
                mrr: Math.floor(results.totalDeposits),
                customers: results.customerCount || 2,
                growth: `${((netFlow / (results.totalBalance || 1)) * 100).toFixed(1)}%`,
                score: uiScore,
                tier,
                maxLoan: Math.floor(results.totalDeposits * 3),
                apy,
                metrics: { g: Math.floor(g), r: Math.floor(r), c: Math.floor(c), s: Math.floor(s) },
                totalBalance: Math.floor(results.totalBalance),
                totalDeposits: Math.floor(results.totalDeposits),
                totalWithdrawals: Math.floor(results.totalWithdrawals)
            };

            addLog(`Minting Proof: ${uiScore} Score / $${analyzedData.mrr.toLocaleString()} MRR`);

            setBusinessData(analyzedData);
            setAnalysisStatus("verifying");
            setStatusMsg("Verifying on-chain...");

            try {
                await handleConnectOracle(analyzedData.mrr, analyzedData.customers);
                setAnalysisStatus("done");
                setStatusMsg("Verified ✓");
                addLog("VERIFICATION COMPLETE.");

                // Refresh dashboard data from oracle
                await checkOracleStatus();
            } catch (oracleErr) {
                setAnalysisStatus("error");
                setStatusMsg("Verification Failed");
                addLog("Verification failed - you can retry.");
            }

        } catch (err) {
            console.error("File processing error:", err);
            addLog(`ERROR: ${err.message}`);
            setAnalysisStatus("error");
            setStatusMsg("Processing Failed");
        } finally {
            setLoading(false);
        }
    };

    const parseFileContent = (lines) => {
        if (lines.length === 0) return null;

        // Detect CSV by comma presence in header
        const isCSV = lines[0].includes(',');

        if (isCSV) {
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const creditIdx = headers.findIndex(h => h.includes('credit'));
            const debitIdx = headers.findIndex(h => h.includes('debit'));
            const balanceIdx = headers.findIndex(h => h.includes('balance'));

            let totalCredits = 0, totalDebits = 0, lastBalance = 0, txCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());

                if (creditIdx >= 0 && cols[creditIdx]) {
                    const val = parseFloat(cols[creditIdx].replace(/[,$]/g, ''));
                    if (!isNaN(val) && val > 0) { totalCredits += val; txCount++; }
                }
                if (debitIdx >= 0 && cols[debitIdx]) {
                    const val = parseFloat(cols[debitIdx].replace(/[,$]/g, ''));
                    if (!isNaN(val) && val > 0) { totalDebits += val; txCount++; }
                }
                if (balanceIdx >= 0 && cols[balanceIdx]) {
                    const val = parseFloat(cols[balanceIdx].replace(/[,$]/g, ''));
                    if (!isNaN(val)) lastBalance = val;
                }
            }

            addLog(`Parsed CSV: Credits=$${totalCredits.toLocaleString()}, Debits=$${totalDebits.toLocaleString()}, Balance=$${lastBalance.toLocaleString()}`);

            return {
                totalDeposits: totalCredits,
                totalWithdrawals: totalDebits,
                totalBalance: lastBalance,
                txCount,
                customerCount: 2
            };
        }

        // PDF/Text fallback parsing using regex and keywords
        let totalDeposits = 0, totalWithdrawals = 0, lastBalance = 0, txCount = 0;
        const amountRegex = /-?\d{1,3}(?:,\d{3})*(?:\.\d+)?|-?\d+(?:\.\d+)?/g;

        for (const line of lines) {
            const lower = line.toLowerCase();
            const matches = line.match(amountRegex);
            if (!matches) continue;

            for (const raw of matches) {
                const val = parseFloat(raw.replace(/,/g, ''));
                if (isNaN(val) || Math.abs(val) === 0) continue;

                if (lower.includes('deposit') || lower.includes('credit') || lower.includes('cr')) {
                    totalDeposits += Math.abs(val);
                    txCount++;
                } else if (lower.includes('withdraw') || lower.includes('debit') || lower.includes('dr')) {
                    totalWithdrawals += Math.abs(val);
                    txCount++;
                }

                if (lower.includes('balance')) {
                    lastBalance = Math.abs(val);
                }
            }
        }

        // If balance missing, estimate from net flow
        if (lastBalance === 0 && totalDeposits > 0) {
            lastBalance = Math.max(0, totalDeposits - totalWithdrawals);
        }

        addLog(`Parsed PDF/Text: Deposits=$${totalDeposits.toLocaleString()}, Withdrawals=$${totalWithdrawals.toLocaleString()}, Balance=$${lastBalance.toLocaleString()}, Tx=${txCount}`);

        return {
            totalDeposits,
            totalWithdrawals,
            totalBalance: lastBalance,
            txCount,
            customerCount: 2
        };
    };

    const handleConnectOracle = async (mrr, customers) => {
        if (!account) {
            addLog("ERROR: Wallet not connected. Please connect to continue.");
            throw new Error("Wallet not connected");
        }
        try {
            const signer = await provider.getSigner();
            const oracle = new ethers.Contract(CONTRACT_ADDRESSES.RevenueOracleConnector, REVENUE_ORACLE_ABI, signer);

            addLog("Preparing on-chain verification...");
            addLog(`MRR: ${mrr.toLocaleString()} USD, Customers: ${customers}`);

            // Convert MRR from USD to USDC format (6 decimals)
            const mrrInUSDC = Math.floor(mrr * 1_000_000);
            addLog(`MRR in USDC: ${mrrInUSDC.toLocaleString()}`);

            let gasEstimate;
            try {
                gasEstimate = await oracle.update.estimateGas(account, mrrInUSDC, customers, 200);
                addLog(`Gas Estimate: ${gasEstimate.toString()}`);
            } catch (estimateErr) {
                addLog(`Gas estimation failed, using default`);
                gasEstimate = 800000n;
            }

            const gasLimit = (gasEstimate * 120n) / 100n;

            addLog("Requesting Signature...");
            const tx = await oracle.update(account, mrrInUSDC, customers, 200, { gasLimit });
            addLog(`Tx Submitted: ${tx.hash.slice(0, 10)}...`);

            addLog("Waiting for Blockchain Confirmation...");
            const receipt = await tx.wait();
            addLog(`Confirmed in block ${receipt.blockNumber}`);
            addLog("On-chain record updated successfully ✓");

            return true;
        } catch (err) {
            console.error("Oracle Update Failed:", err);
            addLog(`ERROR: ${err.reason || err.message}`);
            throw err;
        }
    };

    const handleMint = async () => {
        if (!account) {
            alert("Please connect your wallet first");
            return;
        }

        if (businessData.maxLoan <= 0 || !businessData.metrics) {
            addLog("Cannot mint: No valid revenue data or metrics available");
            alert("Cannot mint bond: Please complete revenue verification first");
            return;
        }

        setProcessing(true);

        try {
            const signer = await provider.getSigner();
            const factory = new ethers.Contract(
                CONTRACT_ADDRESSES.BondFactory,
                BOND_FACTORY_ABI,
                signer
            );

            const oracle = new ethers.Contract(
                CONTRACT_ADDRESSES.RevenueOracleConnector,
                REVENUE_ORACLE_ABI,
                provider
            );

            // 1. Check oracle status
            addLog("Verifying on-chain business status...");
            const oracleData = await oracle.get(account);

            if (!oracleData.verified) {
                throw new Error("Your business is not verified on-chain. Please re-verify.");
            }

            addLog(`Verified ✓ | MRR: $${(Number(oracleData.mrr) / 1_000_000).toLocaleString()}`);

            // 2. Use small fixed amount for reliable minting (change to dynamic later)
            const amountToMint = ethers.parseUnits("3000", 6); // $3,000 - safe for testing

            const { g, r, c, s } = businessData.metrics;

            const params = [account, amountToMint, g, r, c, s];

            console.log("Mint params:", {
                business: account,
                amountUSD: Number(amountToMint) / 1_000_000,
                g, r, c, s
            });

            // 3. Estimate gas properly
            addLog("Estimating gas...");
            let gasLimit;
            try {
                const estimatedGas = await factory.create.estimateGas(...params);
                // Add 20% buffer to estimated gas
                gasLimit = (estimatedGas * 120n) / 100n;
                addLog(`Gas estimated: ${estimatedGas.toString()} (using ${gasLimit.toString()})`);
            } catch (gasErr) {
                console.warn("Gas estimation failed, using fallback:", gasErr);
                // Fallback to higher gas limit if estimation fails
                gasLimit = 5000000n;
                addLog(`Gas estimation failed, using fallback: ${gasLimit.toString()}`);
            }

            // 4. Send the transaction with proper gas limit
            addLog("Sending transaction...");
            const tx = await factory.create(...params, {
                gasLimit: gasLimit
            });

            addLog(`Tx submitted: ${tx.hash}`);
            addLog("Waiting for confirmation...");

            const receipt = await tx.wait();

            if (receipt.status === 0) {
                throw new Error("Transaction reverted on-chain");
            }

            addLog(`Success! Confirmed in block ${receipt.blockNumber}`);
            setBondMinted(true);
            await fetchMyBonds();

            alert("Bond successfully minted!\nPrincipal: $3,000\nYour pool is now open.");

        } catch (err) {
            console.error("Mint failed:", err);

            let message = "Mint failed";
            let details = err.message || "";

            if (err.code === "CALL_EXCEPTION" || err.code === "UNPREDICTABLE_GAS_LIMIT") {
                message = "Transaction would fail - check business verification and MRR requirements";
                details = "Ensure your business has sufficient MRR on-chain (minimum $1000)";
            } else if (err.code === "INSUFFICIENT_FUNDS") {
                message = "Insufficient funds for gas";
                details = "Add more tokens to your wallet for transaction fees";
            } else if (err.message.includes("user rejected")) {
                message = "Transaction rejected by user";
                details = "";
            } else if (err.message.includes("Internal JSON-RPC error") || err.message.includes("execution reverted")) {
                message = "RPC error or contract revert";
                details = "Try: 1) Smaller amount, 2) Different RPC, or 3) Check business verification";
            }

            addLog(`ERROR: ${err.message}`);
            alert(message + (details ? `\n\n${details}` : "") + "\n\nCheck console for full details.");
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!bondDetails || !bondDetails.vault) {
            alert("No bond found. Please create a bond first.");
            return;
        }

        if (parseFloat(bondDetails.available) <= 0) {
            alert("No funds available to withdraw.");
            return;
        }

        if (!bondDetails.isKYCVerified) {
            navigate('/kyc');
            return;
        }

        setProcessing(true);
        try {
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(bondDetails.vault, ESCROW_VAULT_ABI, signer);

            const tx = await vault.withdraw();
            await tx.wait();

            alert(`✅ Withdrawal Successful!\n\nAmount: $${bondDetails.available}`);
            await fetchMyBonds();
        } catch (err) {
            console.error("Withdrawal failed:", err);
            alert("Withdrawal failed: " + (err.reason || err.message));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            {
                !(connected || bondMinted || myBonds.length > 0) ? (
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div className="fintech-card">
                            <div style={{ padding: '2rem', textAlign: 'center', borderBottom: 'var(--border)' }}>
                                <div style={{ background: '#111', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <FileText size={24} className="text-highlight" />
                                </div>
                                <h2>Revenue Verification</h2>
                                <p className="text-muted" style={{ margin: '1rem 0' }}>
                                    Upload your bank statements (PDF or CSV). <br />
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Looking for: "Deposit", "Credit", "Withdrawal", "Ending Balance"</span>
                                </p>
                            </div>
                            <div style={{ padding: '2rem' }}>
                                <input type="file" id="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".csv,.pdf" disabled={loading || !account} />

                                {!loading && analysisStatus !== 'error' && (
                                    account ? (
                                        <label htmlFor="file" className="btn-secondary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '1.5rem', border: '1px dashed #444', cursor: 'pointer' }}>
                                            <Upload size={20} style={{ marginBottom: 8 }} /><br />
                                            Click to Upload Statement
                                        </label>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed #444', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                            <Wallet size={24} className="text-muted" style={{ marginBottom: '1rem' }} />
                                            <p className="text-muted" style={{ marginBottom: '1rem' }}>Connect your wallet to verify revenue</p>
                                            {/* Note: In a real app, we'd trigger the connectWallet from App.jsx here, 
                                                 but since it's passed down, we use the Nav's button or a local trigger if available. */}
                                            <p style={{ fontSize: '0.8rem', color: '#555' }}>Wallet connection required for on-chain proof.</p>
                                        </div>
                                    )
                                )}

                                {/* EXTRACTION LOGS VIEW */}
                                {(loading || analysisStatus === 'error' || analysisStatus === 'done' || analysisStatus === 'verifying') && (
                                    <div style={{ background: '#000', border: '1px solid #333', borderRadius: '4px', padding: '1rem', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>
                                            <Terminal size={14} color="#666" />
                                            <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-mono)' }}>EXTRACTION ENGINE V1.0</span>
                                        </div>
                                        <div style={{ height: '200px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#444' }}>
                                            {extractionLogs.map((log, i) => (
                                                <div key={i} style={{
                                                    marginBottom: '4px',
                                                    color: log.includes("Revenue") || log.includes("Deposits") ? '#4ade80' :
                                                        (log.includes("Expense") || log.includes("Withdrawals") ? '#f87171' :
                                                            (log.includes("Balance") ? '#60a5fa' :
                                                                (log.includes("COMPLETE") || log.includes("Verified") ? '#2DD4BF' :
                                                                    (log.includes("ERROR") ? '#ef4444' : '#888'))))
                                                }}>
                                                    {log}
                                                </div>
                                            ))}
                                            <div ref={logsEndRef} />
                                        </div>
                                    </div>
                                )}

                                {analysisStatus === 'error' && (
                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <button onClick={() => { setLoading(false); setAnalysisStatus('idle'); setExtractionLogs([]); }} className="btn-secondary" style={{ borderColor: 'red', color: 'red' }}>
                                            Reset Engine
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Metrics Grid - Added Balance */}
                        <div className="grid-3">
                            <div className="fintech-card">
                                <h4>Monthly Revenue</h4>
                                <div className="stat-value">${businessData.mrr.toLocaleString()}</div>
                                <div className="mt-4 flex-between">
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>vs last month</span>
                                    <span className="badge badge-success">{businessData.growth}</span>
                                </div>
                            </div>

                            <div className="fintech-card">
                                <h4>Stability Score</h4>
                                <div className="stat-value">{businessData.score}</div>
                                <div className="mt-4 flex-between">
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Risk Tier</span>
                                    <span className="badge badge-gold">Tier {businessData.tier}</span>
                                </div>
                            </div>

                            <div className="fintech-card">
                                <h4>Total Balance</h4>
                                <div className="stat-value text-highlight">${businessData.totalBalance.toLocaleString()}</div>
                                <div className="mt-4 flex-between">
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>From Statement</span>
                                    <span style={{ fontSize: '0.8rem' }}>Updated</span>
                                </div>
                            </div>
                        </div>

                        {/* Minting Section */}
                        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            <div className="fintech-card">
                                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                    <h3>Capital Formation</h3>
                                    {bondMinted && <span className="badge badge-success">Active Bond</span>}
                                </div>

                                {myBonds.length > 0 ? (
                                    // Existing active bond UI with investment status
                                    <>
                                        <div style={{ background: '#0c1f1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1a3d35', marginBottom: '1rem' }}>
                                            <div className="flex-between">
                                                <div>
                                                    <h4 style={{ color: '#4FF0D2', marginBottom: 4 }}>Bond Active</h4>
                                                    <p style={{ fontSize: '0.9rem', color: '#888' }}>ID: {myBonds[0]}</p>
                                                </div>
                                                <CheckCircle size={24} color="#4FF0D2" />
                                            </div>
                                        </div>

                                        {bondDetails && (
                                            <div style={{ background: '#1a1a2e', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <DollarSign size={20} className="text-highlight" />
                                                    <h4>Investment Summary</h4>
                                                </div>

                                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                                                    <div className="flex-between">
                                                        <span className="text-muted">Total Raised</span>
                                                        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>${parseFloat(bondDetails.totalRaised).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex-between">
                                                        <span className="text-muted">Already Withdrawn</span>
                                                        <span>${parseFloat(bondDetails.totalWithdrawn).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex-between" style={{ paddingTop: '1rem', borderTop: '1px solid #333' }}>
                                                        <span style={{ fontWeight: 600 }}>Available to Withdraw</span>
                                                        <span style={{ fontSize: '1.3rem', fontWeight: 600, color: '#4FF0D2' }}>${parseFloat(bondDetails.available).toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {!bondDetails.isKYCVerified && parseFloat(bondDetails.available) > 0 && (
                                                    <div style={{ background: '#2a1a0a', padding: '1rem', borderRadius: '4px', border: '1px solid #ff9800', marginBottom: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                                                            <AlertCircle size={18} color="#ff9800" style={{ marginTop: 2 }} />
                                                            <div style={{ flex: 1 }}>
                                                                <strong style={{ color: '#ff9800' }}>KYC Required</strong>
                                                                <p style={{ fontSize: '0.85rem', color: '#ccc', marginTop: 4 }}>
                                                                    Complete business verification to withdraw funds. Investor deposits are held securely in escrow.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={handleWithdraw}
                                                    disabled={processing || parseFloat(bondDetails.available) <= 0}
                                                    className="btn-primary"
                                                    style={{ width: '100%' }}
                                                >
                                                    {processing ? (
                                                        <><Loader size={16} className="spin" style={{ marginRight: 8 }} /> Processing...</>
                                                    ) : parseFloat(bondDetails.available) > 0 ? (
                                                        `Withdraw $${parseFloat(bondDetails.available).toLocaleString()}`
                                                    ) : (
                                                        "No Funds Available"
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Normal inputs when eligible */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: 8 }}>
                                                    Principal Amount
                                                </label>
                                                <input value={`$${businessData.maxLoan.toLocaleString()}`} disabled />
                                            </div>
                                            <div>
                                                <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: 8 }}>
                                                    Maturity
                                                </label>
                                                <input value="12 Months" disabled />
                                            </div>
                                        </div>

                                        <div style={{ borderTop: 'var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div className="flex-between mb-2">
                                                <span className="text-muted">Yield (APY)</span>
                                                <span>{businessData.apy}</span>
                                            </div>
                                            <div className="flex-between">
                                                <span className="text-muted">Repayment Cap</span>
                                                <span>10% of Revenue</span>
                                            </div>
                                        </div>

                                        {/* Eligibility Check + Warning */}
                                        {businessData.score < 0.4 ||
                                            businessData.totalBalance <= 1000 ||
                                            businessData.mrr < 500 ||
                                            businessData.totalDeposits <= 0 ||
                                            businessData.maxLoan < 1000 ? (
                                            <div
                                                className="fintech-card"
                                                style={{
                                                    background: 'rgba(127, 29, 29, 0.15)',
                                                    border: '1px solid #7f1d1d',
                                                    padding: '1.5rem',
                                                    borderRadius: '8px',
                                                    marginTop: '1rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                    <AlertCircle size={24} color="#ef4444" />
                                                    <h3 style={{ margin: 0, color: '#f87171', fontSize: '1.25rem' }}>
                                                        Ineligible at this time
                                                    </h3>
                                                </div>

                                                <p style={{ color: '#fecaca', lineHeight: '1.5' }}>
                                                    Your Stability Score ({businessData.score}) and $0 ending balance indicate insufficient liquidity and revenue consistency.
                                                    <br /><br />
                                                    Bonds require a healthier financial profile to protect both you and investors.
                                                </p>

                                                <div style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: '#fda4af' }}>
                                                    <strong>Most common reasons in your case:</strong>
                                                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                                                        {businessData.score < 0.4 && (
                                                            <li>Stability Score too low ({businessData.score})</li>
                                                        )}
                                                        {businessData.totalBalance <= 0 && (
                                                            <li>Ending balance is $0</li>
                                                        )}
                                                        {businessData.mrr < 500 && (
                                                            <li>Monthly revenue too low (${businessData.mrr.toLocaleString()})</li>
                                                        )}
                                                        {businessData.totalDeposits <= 0 && (
                                                            <li>No significant deposits detected</li>
                                                        )}
                                                    </ul>
                                                </div>

                                                <p style={{ marginTop: '1.25rem', color: '#fecaca', fontSize: '0.9rem' }}>
                                                    <strong>Next steps:</strong> Upload a more recent or active bank statement showing consistent deposits, positive net flow, and a healthy ending balance.
                                                </p>
                                            </div>
                                        ) : (
                                            // Only show clickable button when eligible
                                            <button
                                                className="btn-primary"
                                                style={{ width: '100%' }}
                                                onClick={handleMint}
                                                disabled={processing}
                                            >
                                                {processing ? 'Processing Transaction...' : 'Mint Bond & Open Pool'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Insights Panel - Updated with balance/net flow */}
                            <div className="fintech-card">
                                <h3 style={{ marginBottom: '1rem' }}>Insights</h3>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <TrendingUp className="text-highlight" size={20} />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Positive Trend</div>
                                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                                            Net flow is ${(businessData.totalDeposits - businessData.totalWithdrawals).toLocaleString()} over the period.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <AlertCircle color={businessData.tier === "D" ? "#ef4444" : "#D4AF37"} size={20} />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{businessData.tier === "D" ? "Critical Action" : "Optimization"}</div>
                                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                                            {businessData.tier === "D"
                                                ? "Profile does not meet minimum liquidity requirements for bond issuance."
                                                : `Balance health: ${businessData.totalBalance > businessData.totalWithdrawals ? 'Strong' : 'Monitor'} liquidity.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
}
