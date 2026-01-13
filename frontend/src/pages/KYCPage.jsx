import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import { ethers } from 'ethers';

export default function KYCPage({ account, provider }) {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [kycSubmitted, setKycSubmitted] = useState(false);
    const [kycForm, setKycForm] = useState({
        businessName: "",
        registrationNumber: "",
        country: "Nigeria",
        registrationType: "CAC"
    });

    const handleKYCSubmit = async (e) => {
        e.preventDefault();
        if (!kycForm.businessName || !kycForm.registrationNumber) {
            alert("Please fill all fields");
            return;
        }

        setProcessing(true);
        try {
            // In a real app, this would be an API call to a backend
            // For now, we simulate by saving to localStorage for the Admin Dashboard to pick up
            const kycData = {
                address: account,
                businessName: kycForm.businessName,
                registrationNumber: kycForm.registrationNumber,
                country: kycForm.country,
                registrationType: kycForm.registrationType,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            const submissions = JSON.parse(localStorage.getItem('kycSubmissions') || '[]');
            submissions.push(kycData);
            localStorage.setItem('kycSubmissions', JSON.stringify(submissions));

            setKycSubmitted(true);
        } catch (err) {
            console.error("KYC submission failed:", err);
            alert("KYC submission failed: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
            <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
                style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="fintech-card" style={{ padding: '0' }}>
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)', padding: '2rem', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(45, 212, 191, 0.1)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={24} color="#2DD4BF" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0 }}>Business Verification</h2>
                            <p className="text-muted" style={{ margin: 4 }}>Complete your KYC to enable withdrawals</p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    {!kycSubmitted ? (
                        <form onSubmit={handleKYCSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div>
                                    <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Country of Registration</label>
                                    <select
                                        value={kycForm.country}
                                        onChange={(e) => {
                                            const country = e.target.value;
                                            const typeMap = {
                                                "Nigeria": "CAC",
                                                "United States": "EIN",
                                                "United Kingdom": "Company House",
                                                "Canada": "BN",
                                                "Other": "Business Registration"
                                            };
                                            setKycForm({
                                                ...kycForm,
                                                country,
                                                registrationType: typeMap[country] || "Business Registration"
                                            });
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#0a0a16',
                                            border: '1px solid #333',
                                            borderRadius: '6px',
                                            color: 'white'
                                        }}
                                    >
                                        <option value="Nigeria">Nigeria</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Registration Type</label>
                                    <input
                                        value={kycForm.registrationType}
                                        disabled
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid #333',
                                            borderRadius: '6px',
                                            color: '#888'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Official Business Name</label>
                                <input
                                    type="text"
                                    value={kycForm.businessName}
                                    onChange={(e) => setKycForm({ ...kycForm, businessName: e.target.value })}
                                    placeholder="e.g., Acme Technologies Ltd"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0a0a16',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        color: 'white'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{kycForm.registrationType} Number</label>
                                <input
                                    type="text"
                                    value={kycForm.registrationNumber}
                                    onChange={(e) => setKycForm({ ...kycForm, registrationNumber: e.target.value })}
                                    placeholder={kycForm.country === "Nigeria" ? "e.g., RC123456" : "Registration number"}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0a0a16',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        color: 'white'
                                    }}
                                    required
                                />
                            </div>

                            {kycForm.country === "Nigeria" && (
                                <div style={{
                                    background: 'rgba(45, 158, 255, 0.05)',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    marginBottom: '2rem',
                                    border: '1px solid rgba(45, 158, 255, 0.2)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <AlertCircle color="#4a9eff" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a9eff', lineHeight: '1.5' }}>
                                            Recurr uses the <strong>Corporate Affairs Commission (CAC)</strong> registry to verify Nigerian businesses. Ensure your details match your official registration.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                {processing ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Loader size={18} className="spin" /> Submitting...
                                    </span>
                                ) : "Submit for Verification"}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'rgba(45, 212, 191, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <CheckCircle size={40} color="#2DD4BF" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Submission Successful</h3>
                            <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                                Your business registration details have been submitted for review. Admin will verify your status via the official registry.
                            </p>

                            <div style={{
                                background: '#1a1a2e',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                textAlign: 'left',
                                marginBottom: '2rem'
                            }}>
                                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                    <span className="text-muted">Business:</span>
                                    <span>{kycForm.businessName}</span>
                                </div>
                                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                    <span className="text-muted">{kycForm.registrationType}:</span>
                                    <span>{kycForm.registrationNumber}</span>
                                </div>
                                <div className="flex-between">
                                    <span className="text-muted">Status:</span>
                                    <span style={{ color: '#ff9800' }}>Pending Review</span>
                                </div>
                            </div>

                            <button onClick={() => navigate('/business')} className="btn-secondary" style={{ width: '100%' }}>
                                Return to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
