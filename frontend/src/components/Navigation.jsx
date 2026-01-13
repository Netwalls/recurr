import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet } from 'lucide-react';

export default function Navigation({ account, connect }) {
    const location = useLocation();

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
                    gap: '0.8rem',
                    textDecoration: 'none',
                    fontWeight: '700'
                }}>
                    <img src="/logo.png" alt="recurr logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    recurr
                </Link>

                {/* Desktop Links - Centered */}
                <div className="nav-links hidden-mobile" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <Link to="/business" className={`nav-link ${isActive('/business') ? 'active' : ''}`}>
                        For Business
                    </Link>
                    <Link to="/invest" className={`nav-link ${isActive('/invest') ? 'active' : ''}`}>
                        For Investors
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
                </div>
            </div>

        </nav>
    );
}
