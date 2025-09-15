# 🏥 MediFund - Tokenized Patient Sponsorship Platform

A decentralized Web3 platform that bridges the gap between patients needing experimental biotech treatments and global communities willing to help through transparent, blockchain-based sponsorship.

## 🌟 Features

### For Patients
- **Create Sponsorship Campaigns**: Submit treatment requests with medical details and funding goals
- **NFT Proof of Campaign**: Receive a Patient Sponsorship NFT as immutable proof of your campaign
- **Transparent Funding**: All contributions are visible and verifiable on-chain
- **Secure Fund Release**: Access funds only when goals are reached

### For Sponsors
- **Browse Active Campaigns**: Discover patients who need help with their treatments
- **Contribute with USDC/$LIVES**: Support campaigns using stable cryptocurrency
- **Impact NFTs**: Receive soulbound NFTs as proof of your contribution when goals are met
- **Full Transparency**: Track exactly how your contributions are used

### Platform Features
- **IPFS Storage**: All patient data stored immutably on IPFS for transparency
- **Real Wallet Integration**: Connect with MetaMask, WalletConnect, and more via RainbowKit
- **Responsive Design**: Beautiful, accessible interface that works on all devices
- **Progress Tracking**: Real-time funding progress and campaign analytics

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity**: Core contract logic for campaigns and NFT management
- **OpenZeppelin**: Secure, battle-tested contract standards
- **ERC-721**: NFT standard for campaign and impact tokens

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety throughout the application
- **TailwindCSS**: Beautiful, responsive styling system
- **RainbowKit**: Best-in-class wallet connection experience
- **Wagmi**: React hooks for Ethereum interactions
- **Viem**: TypeScript-native Ethereum library

### Web3 Infrastructure
- **IPFS/Pinata**: Decentralized storage for patient data and metadata
- **Ethereum/Base**: Blockchain networks for smart contract deployment
- **USDC**: Stable cryptocurrency for predictable funding
- **$LIVES Token**: Platform-native token for enhanced features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Web3 wallet (MetaMask recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/medifund/tokenized-sponsorship.git
cd tokenized-sponsorship
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Get Pinata API keys from [pinata.cloud](https://pinata.cloud)
- Get Alchemy API key from [alchemy.com](https://alchemy.com)
- Get WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

4. **Start the development server**
```bash
npm run dev
```

5. **Open the application**
Navigate to `http://localhost:5173` in your browser.

## 📝 Smart Contract Deployment

### Local Development
```bash
# Start local Hardhat node
npm run node

# In another terminal, compile contracts
npm run compile

# Deploy to local hardhat network
npm run deploy:local

# Deploy to testnet (Goerli)
npm run deploy:goerli

# Verify on Etherscan
npm run verify --network goerli DEPLOYED_CONTRACT_ADDRESS
```

### Mainnet Deployment
```bash
# Deploy to Ethereum mainnet
npm run deploy:mainnet

# Deploy to Base
npm run deploy:base
```

Update your `.env` file with the deployed contract address.

## 🔧 Configuration

### Environment Variables

```env
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt_token

# Alchemy Configuration
VITE_ALCHEMY_ID=your_alchemy_api_key

# WalletConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Contract Configuration
VITE_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D428Ec9AF98de5b1
```

### Supported Networks
- Ethereum Mainnet
- Base Network
- Polygon
- Goerli Testnet (for development)

## 📱 Usage Guide

### Creating a Campaign (Patient)
1. Connect your Web3 wallet
2. Click "Create Campaign" 
3. Fill in your medical details, treatment needs, and funding goal
4. Upload supporting medical documents (optional)
5. Submit - your campaign NFT will be minted automatically

### Supporting a Campaign (Sponsor)
1. Connect your Web3 wallet
2. Browse campaigns on the dashboard
3. Click on a campaign to view details
4. Choose contribution amount and token (USDC/$LIVES)
5. Confirm transaction - you'll receive an Impact NFT when the goal is reached

### Withdrawing Funds (Patient)
1. Campaign must reach its funding goal
2. Go to your campaign page
3. Click "Withdraw Funds"
4. Confirm transaction - funds will be transferred to your wallet

## 🔒 Security Features

### Smart Contract Security
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Role-based Access**: Only patients can withdraw their funds
- **Goal Verification**: Funds only released when goals are met
- **Immutable Records**: All transactions permanently recorded

### Data Privacy
- **IPFS Storage**: Decentralized, censorship-resistant storage
- **Optional Medical Documents**: Patients control what they share
- **Wallet-based Identity**: No personal information required beyond wallet

### Financial Security
- **Stable Tokens**: USDC provides price stability
- **Transparent Funding**: All contributions visible on-chain
- **Escrow System**: Funds held in smart contract until goals met

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.medifund.app](https://docs.medifund.app)
- **Discord Community**: [discord.gg/medifund](https://discord.gg/medifund)
- **GitHub Issues**: [Report bugs or request features](https://github.com/medifund/tokenized-sponsorship/issues)
- **Email**: support@medifund.app

## 🙏 Acknowledgments

- **OpenZeppelin**: For secure smart contract standards
- **RainbowKit**: For excellent wallet connection UX
- **Pinata**: For reliable IPFS infrastructure
- **The Community**: For making decentralized healthcare funding possible

---

**Made with ❤️ for the healthcare community by the MediFund team**

*Bridging the gap between patients and sponsors through transparent Web3 technology*