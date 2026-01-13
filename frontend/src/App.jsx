import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import BusinessDashboard from './pages/BusinessDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import KYCPage from './pages/KYCPage';
import AdminDashboard from './pages/AdminDashboard';
import { MANTLE_SEPOLIA_CHAIN_ID, LOCAL_CHAIN_ID } from './config/contracts';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    console.log("Connect Wallet Triggered");
    if (window.ethereum) {
      try {
        console.log("Requesting accounts...");
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await _provider.send("eth_requestAccounts", []);
        console.log("Accounts received:", accounts);


        const network = await _provider.getNetwork();
        setChainId(Number(network.chainId));
        setProvider(_provider);
        setAccount(accounts[0]);

        // Validation
        // Validation: Allow Sepolia (5003), Mainnet (5000), or Local (31337)
        const currentChain = Number(network.chainId);
        if (currentChain !== MANTLE_SEPOLIA_CHAIN_ID && currentChain !== LOCAL_CHAIN_ID && currentChain !== 5000) {
          alert(`Wrong Network! you are on Chain ID: ${currentChain}. Please switch to Mantle Sepolia (5003).`);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        <Navigation account={account} connect={connectWallet} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/business"
            element={
              <BusinessDashboard
                account={account}
                provider={provider}
                chainId={chainId}
              />
            }
          />
          <Route
            path="/invest"
            element={
              <InvestorDashboard
                account={account}
                provider={provider}
                chainId={chainId}
              />
            }
          />
          <Route
            path="/kyc"
            element={
              <KYCPage
                account={account}
                provider={provider}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminDashboard
                account={account}
                provider={provider}
                chainId={chainId}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
