import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation({ account, connect }) {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="nav-header">
            <div className="nav-content">
                {/* 1. Brand Name Fix: Recurr (Centered/cleaner) */}
                <Link to="/" className="logo" style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    letterSpacing: '-0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        width: '24px', height: '24px',
                        background: 'linear-gradient(135deg, #2DD4BF, #2D88D4)',
                        borderRadius: '6px'
                    }}></div>
                    Recurr
                </Link>

                {/* Desktop Links - Centered */}
                <div className="nav-links hidden-mobile" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <Link to="/business" className={`nav-link ${isActive('/business') ? 'active' : ''}`}>
                        For Business
                    </Link>
                    <Link to="/invest" className={`nav-link ${isActive('/invest') ? 'active' : ''}`}>
                        For Investors
                    </Link>
                    <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                        Admin
                    </Link>
                </div>

                {/* Connect Wallet */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={connect}
                        className="btn-secondary"
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            background: account ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                            borderColor: account ? 'rgba(45, 212, 191, 0.3)' : '#333',
                            color: account ? '#2DD4BF' : 'white',
                            fontFamily: 'var(--font-mono)'
                        }}
                    >
                        {account ?
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, background: '#2DD4BF', borderRadius: '50%', boxShadow: '0 0 8px #2DD4BF' }}></div>
                                {account.slice(0, 6)}...{account.slice(-4)}
                            </span>
                            : "Connect Wallet"
                        }
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button className="mobile-only" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'none', color: 'white' }}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay (Simple) */}
            {isMobileMenuOpen && (
                <div style={{
                    position: 'absolute', top: '70px', left: '0', right: '0',
                    background: '#111', padding: '2rem',
                    borderBottom: '1px solid #333',
                    display: 'flex', flexDirection: 'column', gap: '1.5rem'
                }}>
                    <Link to="/business" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white' }}>For Business</Link>
                    <Link to="/invest" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white' }}>For Investors</Link>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white' }}>Admin</Link>
                </div>
            )}
        </nav>
    );
}
