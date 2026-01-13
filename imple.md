# recurr Implementation & Contribution Guide

Thank you for your interest in contributing to **recurr**! This document outlines how you can set up your environment and contribute to the protocol.

## 🛠 Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Foundry**: For smart contract development ([Install Foundry](https://book.getfoundry.sh/getting-started/installation))
- **MetaMask**: To interact with the frontend

### 1. Smart Contract Backend
The contracts are located in the `contract/` directory.
```bash
cd contract
forge install
forge build
forge test
```

### 2. Frontend Development
The frontend is a Vite + React application.
```bash
cd frontend
npm install
npm run dev
```

## 🤝 How to Contribute

### 1. Report Bugs
Open an issue on GitHub with a clear title and description. Include steps to reproduce the bug and your environment details.

### 2. Suggest Features
If you have an idea for a new feature, open a "Feature Request" in the GitHub Issues tab.

### 3. Pull Requests
- **Fork** the repository and create your branch from `main`.
- **Test** your changes! Ensure `forge test` passes and the frontend builds without errors.
- **Maintain Style**: Keep consistent with the existing fintech aesthetic (vibrant colors, dark mode, glassmorphism).
- **Document**: If you add a new feature, update the relevant `.md` files in `docs/`.

## 📜 Coding Standards
- **Solidity**: Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/v0.8.20/style-guide.html). Use descriptive event names and `natspec` comments.
- **React**: Use functional components and hooks. Keep CSS managed in `index.css` using the project's variable tokens.
- **Git**: Use meaningful commit messages (e.g., `feat: add claimable yield display`).

## 📞 Get in Touch
Join our community on [Telegram](https://t.me/GoSTEAN) or [Github](https://github.com/GoSTEAN) to discuss technical implementations.
