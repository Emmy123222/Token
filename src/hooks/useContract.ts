import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

export const useContract = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const createCampaign = async (fundingGoal: string, ipfsHash: string) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    try {
      const { request } = await publicClient!.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createCampaign',
        args: [BigInt(fundingGoal), ipfsHash],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient!.waitForTransactionReceipt({ hash });
      
      return hash;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  const contributeUSDC = async (campaignId: string, amount: string) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    try {
      const { request } = await publicClient!.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'contributeUSDC',
        args: [BigInt(campaignId), BigInt(amount)],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient!.waitForTransactionReceipt({ hash });
      
      return hash;
    } catch (error) {
      console.error('Error contributing USDC:', error);
      throw error;
    }
  };

  const contributeLIVES = async (campaignId: string, amount: string) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    try {
      const { request } = await publicClient!.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'contributeLIVES',
        args: [BigInt(campaignId), BigInt(amount)],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient!.waitForTransactionReceipt({ hash });
      
      return hash;
    } catch (error) {
      console.error('Error contributing LIVES:', error);
      throw error;
    }
  };

  const getActiveCampaigns = async () => {
    try {
      const result = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getActiveCampaigns',
      });

      return (result as bigint[]).map(id => id.toString());
    } catch (error) {
      console.error('Error getting active campaigns:', error);
      return [];
    }
  };

  const getCampaignData = async (campaignId: string) => {
    try {
      const result = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'campaigns',
        args: [BigInt(campaignId)],
      });

      const [id, patient, fundingGoal, currentFunding, ipfsHash, isActive, goalReached, createdAt] = result as any[];
      
      // Get sponsors
      const sponsors = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCampaignSponsors',
        args: [BigInt(campaignId)],
      }) as string[];

      return {
        id: id.toString(),
        patient,
        fundingGoal: Number(fundingGoal) / 1e6, // Convert from 6 decimals
        currentFunding: Number(currentFunding) / 1e6,
        ipfsHash,
        isActive,
        goalReached,
        createdAt: Number(createdAt),
        sponsors,
      };
    } catch (error) {
      console.error('Error getting campaign data:', error);
      return null;
    }
  };

  const getPatientCampaigns = async (patientAddress: string) => {
    try {
      const result = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPatientCampaigns',
        args: [patientAddress as `0x${string}`],
      });

      return (result as bigint[]).map(id => id.toString());
    } catch (error) {
      console.error('Error getting patient campaigns:', error);
      return [];
    }
  };

  const getSponsorImpactNFTs = async (sponsorAddress: string) => {
    try {
      const result = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getSponsorImpactNFTs',
        args: [sponsorAddress as `0x${string}`],
      });

      return (result as bigint[]).map(id => id.toString());
    } catch (error) {
      console.error('Error getting sponsor impact NFTs:', error);
      return [];
    }
  };

  const getSponsorContribution = async (campaignId: string, sponsorAddress: string) => {
    try {
      const result = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getSponsorContribution',
        args: [BigInt(campaignId), sponsorAddress as `0x${string}`],
      });

      return Number(result) / 1e6; // Convert from 6 decimals
    } catch (error) {
      console.error('Error getting sponsor contribution:', error);
      return 0;
    }
  };

  const withdrawFunds = async (campaignId: string) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    try {
      const { request } = await publicClient!.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'withdrawFunds',
        args: [BigInt(campaignId)],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient!.waitForTransactionReceipt({ hash });
      
      return hash;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  };

  return {
    createCampaign,
    contributeUSDC,
    contributeLIVES,
    getActiveCampaigns,
    getCampaignData,
    getPatientCampaigns,
    getSponsorImpactNFTs,
    getSponsorContribution,
    withdrawFunds,
  };
};