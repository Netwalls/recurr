import { Link } from 'react-router-dom';
import { ArrowRight, FileSpreadsheet, Cpu, CheckCircle, TrendingUp, ShieldCheck, Wallet, Github, Twitter, Disc } from 'lucide-react';

export default function LandingPage() {
    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* Hero Section */}
            <section className="container" style={{
                minHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: '6rem',
                position: 'relative'
            }}>
                {/* Technical Grid Background Effect */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    zIndex: -1,
                    opacity: 0.3,
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                }}></div>

                <div className="badge" style={{ marginBottom: '1.5rem', background: '#111', border: '1px solid #333', color: '#888', fontFamily: 'monospace' }}>
                    PROTOCOL v1.0 • MANTLE SEPOLIA
                </div>

                <h1 style={{ maxWidth: '900px', margin: '0 auto 1.5rem auto', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.03em' }}>
                    Small Business Capital, <br />
                    Powered by <span className="text-highlight">Truth</span>.
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    maxWidth: '600px',
                    margin: '0 auto 3rem auto',
                    lineHeight: '1.6'
                }}>
                    We don't just lend money. We verify your business exists. <br />
                    Upload your bank credentials. Get an on-chain health score. <br />
                    <strong style={{ color: 'white' }}>Get funded by global investors instantly.</strong>
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/business" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Prove Revenue <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </Link>
                    <Link to="/invest" className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Start Investing
                    </Link>
                </div>
            </section>

            {/* The Mechanism Flow */}
            <section style={{ borderTop: '1px solid #222', borderBottom: '1px solid #222', background: '#050505', padding: '5rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>How Information Becomes Capital</h2>
                        <p className="text-muted">A trustless pipeline from PDF to Payout.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', position: 'relative' }}>
                        {/* Step 1 */}
                        <div className="fintech-card" style={{ textAlign: 'center', borderColor: '#333' }}>
                            <div style={{ display: 'inline-flex', padding: '1.5rem', background: '#111', borderRadius: '50%', marginBottom: '1.5rem', border: '1px solid #222' }}>
                                <FileSpreadsheet size={32} color="#888" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>1. Submission</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Small businesses upload raw bank statements (PDF/CSV). No pitch decks, no interviews.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="fintech-card" style={{ textAlign: 'center', borderColor: 'var(--primary)', boxShadow: '0 0 20px rgba(45, 212, 191, 0.1)' }}>
                            <div style={{ display: 'inline-flex', padding: '1.5rem', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
                                <Cpu size={32} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>2. Verification</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                The Protocol analyzes cash flow stability, calculates MRR, and mints an on-chain "Health Score".
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="fintech-card" style={{ textAlign: 'center', borderColor: '#333' }}>
                            <div style={{ display: 'inline-flex', padding: '1.5rem', background: '#111', borderRadius: '50%', marginBottom: '1.5rem', border: '1px solid #222' }}>
                                <CheckCircle size={32} color="#fff" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>3. Capital Access</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Smart contracts open a funding pool. Investors earn 15-25% yield backed by verified revenue.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="container" style={{ padding: '6rem 0' }}>
                <div className="grid-3">
                    <div className="fintech-card">
                        <TrendingUp size={24} className="mb-2 text-highlight" />
                        <h4>Data Not Drama</h4>
                        <p className="text-muted">We don't care who you know. We care about your monthly deposits.</p>
                    </div>
                    <div className="fintech-card">
                        <Wallet size={24} className="mb-2 text-highlight" />
                        <h4>Instant Liquidity</h4>
                        <p className="text-muted">Mint bonds in minutes. Receive USDC directly to your wallet.</p>
                    </div>
                    <div className="fintech-card">
                        <ShieldCheck size={24} className="mb-2 text-highlight" />
                        <h4>Math-Based trust</h4>
                        <p className="text-muted">Investors trust the code, not the sales pitch.</p>
                    </div>
                </div>
            </section>

            {/* NEW FOOTER */}
            <footer style={{ borderTop: '1px solid #222', background: '#050505', padding: '4rem 0', marginTop: '4rem' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                                <img src="/logo.png" alt="recurr logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>recurr</span>
                            </div>
                            <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
                                The standard for on-chain revenue verification and financing.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <Twitter size={20} className="text-muted" style={{ cursor: 'pointer' }} />
                                <a href="https://github.com/Netwalls/recurr.git" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <Github size={20} className="text-muted" style={{ cursor: 'pointer' }} />
                                </a>
                                <Disc size={20} className="text-muted" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'white' }}>Protocol</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span>Governance</span>
                                    <span>Developers</span>
                                    <span>Security</span>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'white' }}>Legal</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span>Terms</span>
                                    <span>Privacy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid #222', marginTop: '3rem', paddingTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#444' }}>
                        © 2026 recurr Protocol. Built on Mantle Network.
                    </div>
                </div>
            </footer>
        </div>
    );
}
