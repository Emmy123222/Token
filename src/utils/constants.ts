// Contract Configuration
// TODO: Update with actual deployed contract address
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b8D428Ec9AF98de5b1') as `0x${string}`;

// Contract ABI - Simplified for demo, include full ABI from compilation
export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_usdcToken", "type": "address"},
      {"internalType": "address", "name": "_livesToken", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_fundingGoal", "type": "uint256"},
      {"internalType": "string", "name": "_ipfsHash", "type": "string"}
    ],
    "name": "createCampaign",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "contributeUSDC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "contributeLIVES",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveCampaigns",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "campaigns",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "patient", "type": "address"},
      {"internalType": "uint256", "name": "fundingGoal", "type": "uint256"},
      {"internalType": "uint256", "name": "currentFunding", "type": "uint256"},
      {"internalType": "string", "name": "ipfsHash", "type": "string"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "goalReached", "type": "bool"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getCampaignSponsors",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_patient", "type": "address"}],
    "name": "getPatientCampaigns",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_sponsor", "type": "address"}],
    "name": "getSponsorImpactNFTs",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "address", "name": "_sponsor", "type": "address"}
    ],
    "name": "getSponsorContribution",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Token addresses (Mainnet)
export const USDC_ADDRESS = '0xA0b86a33E6441e8e5B09E74E5cD5bc8D98e12777' as const; // Ethereum mainnet USDC
export const LIVES_TOKEN_ADDRESS = '0x742d35Cc6634C0532925a3b8D428Ec9AF98de5b1' as const; // $LIVES token

// IPFS Configuration
export const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
export const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY || '';
export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

// Network Configuration
export const SUPPORTED_CHAINS = [1, 5, 137, 80001, 8453] as const; // Mainnet, Goerli, Polygon, Mumbai, Base

// App Configuration
export const APP_NAME = 'MediFund - Tokenized Patient Sponsorship';
export const APP_DESCRIPTION = 'Transparent Web3 sponsorship platform for medical treatments';
export const APP_URL = 'https://medifund.app';

// Contract Events
export const CAMPAIGN_CREATED_EVENT = 'CampaignCreated';
export const CONTRIBUTION_MADE_EVENT = 'ContributionMade';
export const GOAL_REACHED_EVENT = 'GoalReached';
export const IMPACT_NFT_MINTED_EVENT = 'ImpactNFTMinted';