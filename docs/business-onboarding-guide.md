# recurr: Business Onboarding & Revenue Verification Guide

Welcome to **recurr**. This guide will walk you through the process of verifying your business revenue on-chain and forming your first capital pool.

## Overview
**recurr** uses a **Verified Revenue-Based Financing (VRBF)** model. By connecting your bank statements (CSV or PDF), our extraction engine calculates a **Stability Score** and **Monthly Recurring Revenue (MRR)**, which are then anchored onto the Mantle blockchain to secure non-dilutive financing from investors.

## Prerequisites
Before you begin, ensure you have the following:
- **MetaMask Wallet**: Installed as a browser extension.
- **Mantle Sepolia Network**: Configured in your wallet with test tokens for gas fees.
- **Financial Statements**: At least 1-3 months of bank statements in `.csv` or `.pdf` format.
    - *Note: Ensure statements include "Deposits", "Credit/Debit", and "Ending Balance" fields.*

---

## Step-by-Step Walkthrough

### 1. Connect Your Wallet
Navigate to the [Business Dashboard](file:///Users/iamtechhunter/Documents/workspace/recurrYeild/frontend/src/pages/BusinessDashboard.jsx) and click "Connect Wallet". This is required to store your revenue proof on-chain.

### 2. Upload and Extract
- Click "Upload Statement" and select your file.
- The **Extraction Engine V1.0** will begin scanning the document.
- Monitor the terminal logs to see real-time progress:
    - `> PDF loaded. Pages: X`
    - `> Analyzing lines...`
    - `> Parsed CSV: Credits=...`

### 3. On-Chain Verification
Once extraction is successful, you will be prompted to sign a transaction in MetaMask.
- **Sign Transaction**: Authorizes the update of your on-chain MRR proof.
- **Wait for Confirmation**: The dashboard will display "Waiting for Blockchain Confirmation".
- **Success**: Upon confirmation, you will automatically be redirected to your **Metrics View**.

### 4. KYC Verification (Mandatory)
Before you can withdraw any funds raised from investors, you must complete the Know Your Customer (KYC) process.
- **Navigate to KYC**: Visit the [KYC Page](file:///Users/iamtechhunter/Documents/workspace/recurrYeild/frontend/src/pages/KYCPage.jsx).
- **Submit Details**: Provide the required business registration and identity documents.
- **Verification**: Once the admin approves your submission, your wallet will be authorized to withdraw funds from the Escrow Vault.

### 5. Mint Your Bond & Withdraw
- Review your **Max Loan** (calculated as 3x your verified MRR).
- Click "Mint Bond & Open Pool" to allow investors to fund your business.
- Once the goal is met (or partially met), and your KYC is verified, use the "Withdraw" button to transfer funds to your wallet.

---

## Best Practices
- **Consistent Data**: Use statements from the same account to maintain a high **Stability Score**.
- **High Resolution PDFs**: If using PDFs, ensure they are text-selectable (not scans) for better extraction accuracy.
- **Compliance Early**: We recommend completing KYC as soon as possible to avoid delays in accessing your capital.

## Troubleshooting
For common errors, please refer to the [Troubleshooting & FAQ Guide](file:///Users/iamtechhunter/Documents/workspace/recurrYeild/TROUBLESHOOTING.md).
