import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, ExternalLink, Loader, ArrowLeft, Search } from 'lucide-react';
import { ethers } from 'ethers';
import { getContractAddresses, KYC_REGISTRY_ABI } from '../config/contracts';

export default function AdminDashboard({ account, provider, chainId }) {
    const CONTRACT_ADDRESSES = getContractAddresses(chainId);
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const loadSubmissions = () => {
            const data = JSON.parse(localStorage.getItem('kycSubmissions') || '[]');
            setSubmissions(data.filter(s => s.status === 'pending'));
        };
        loadSubmissions();
    }, []);

    const handleApprove = async (submission, index) => {
        if (!provider || !account) {
            alert("Connect wallet first");
            return;
        }

        const confirmApprove = window.confirm(
            `🚀 ON-CHAIN APPROVAL\n\n` +
            `Are you sure you want to verify ${submission.businessName}?\n` +
            `This will grant them permission to withdraw funds from their bond vaults.`
        );

        if (!confirmApprove) return;

        setProcessingId(index);
        try {
            const signer = await provider.getSigner();
            const kyc = new ethers.Contract(CONTRACT_ADDRESSES.KYCRegistry, KYC_REGISTRY_ABI, signer);

            console.log("Approving business:", submission.address);
            const tx = await kyc.verifyBusiness(submission.address, true);
            await tx.wait();

            // Update local state
            const allSubmissions = JSON.parse(localStorage.getItem('kycSubmissions') || '[]');
            const updated = allSubmissions.map(s =>
                s.address === submission.address && s.timestamp === submission.timestamp
                    ? { ...s, status: 'approved' }
                    : s
            );
            localStorage.setItem('kycSubmissions', JSON.stringify(updated));
            setSubmissions(updated.filter(s => s.status === 'pending'));

            alert("✅ Business Verified On-Chain!");
        } catch (err) {
            console.error("Approval failed:", err);
            alert("Approval failed: " + (err.reason || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (submission, index) => {
        const reason = window.prompt("Reason for rejection:");
        if (reason === null) return;

        const allSubmissions = JSON.parse(localStorage.getItem('kycSubmissions') || '[]');
        const updated = allSubmissions.map(s =>
            s.address === submission.address && s.timestamp === submission.timestamp
                ? { ...s, status: 'rejected', rejectionReason: reason }
                : s
        );
        localStorage.setItem('kycSubmissions', JSON.stringify(updated));
        setSubmissions(updated.filter(s => s.status === 'pending'));

        alert("❌ Submission Rejected");
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Shield size={32} color="#2DD4BF" />
                    <h1 style={{ margin: 0 }}>Protocol Admin</h1>
                </div>
                <button onClick={() => navigate('/business')} className="btn-secondary">
                    Dashboard View
                </button>
            </div>

            <div className="fintech-card">
                <div style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Pending KYC Verifications</h3>
                    <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Review and verify business registrations via official registries</p>
                </div>

                {submissions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div style={{ color: '#444', marginBottom: '1rem' }}>
                            <Search size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h4 style={{ color: '#888' }}>No pending submissions</h4>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {submissions.map((s, idx) => (
                            <div key={idx} style={{
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                transition: 'border-color 0.2s'
                            }} className="submission-row">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{s.businessName}</h4>
                                            <span style={{ fontSize: '0.7rem', background: '#333', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', color: '#888' }}>
                                                {s.registrationType}
                                            </span>
                                        </div>
                                        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
                                            {s.address}
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                            <div>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Reg Number:</span>
                                                <div style={{ fontWeight: 600 }}>{s.registrationNumber}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Country:</span>
                                                <div style={{ fontWeight: 600 }}>{s.country}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {s.country === "Nigeria" ? (
                                            <a
                                                href={`https://icrp.cac.gov.ng/public-search/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary"
                                                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                                            >
                                                Verify on CAC <ExternalLink size={14} />
                                            </a>
                                        ) : (
                                            <button className="btn-secondary" disabled style={{ fontSize: '0.8rem' }}>
                                                Check Registry <ExternalLink size={14} />
                                            </button>
                                        )}

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleReject(s, idx)}
                                                className="btn-secondary"
                                                style={{ padding: '0.5rem', borderColor: '#ff4444', color: '#ff4444' }}
                                                title="Reject"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(s, idx)}
                                                disabled={processingId !== null}
                                                className="btn-primary"
                                                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                {processingId === idx ? <Loader size={16} className="spin" /> : <CheckCircle size={18} />}
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #222', fontSize: '0.75rem', color: '#666' }}>
                                    Submitted on: {new Date(s.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
