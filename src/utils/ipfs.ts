import axios from 'axios';

// IPFS gateways for retrieving data
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

export const getFromIPFS = async (hash: string): Promise<any> => {
  // Check localStorage first for demo data
  const localData = localStorage.getItem(`ipfs_${hash}`);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (error) {
      console.error('Error parsing local IPFS data:', error);
    }
  }

  // Try each gateway until one works
  for (const gateway of IPFS_GATEWAYS) {
    try {
      console.log(`🔍 Trying gateway: ${gateway}${hash}`);
      const response = await axios.get(`${gateway}${hash}`, {
        timeout: 10000, // 10 second timeout
      });

      console.log('✅ Successfully retrieved from IPFS:', hash);
      return response.data;
    } catch (error) {
      console.warn(`❌ Gateway ${gateway} failed:`, error);
      continue;
    }
  }

  // If all gateways fail, return demo data
  console.warn('⚠️ All IPFS gateways failed, returning demo data');
  return {
    title: 'Demo Campaign',
    description: 'This is a demo campaign for testing purposes.',
    treatmentDetails: 'Demo treatment details would appear here.',
    urgency: 'medium',
    createdAt: new Date().toISOString(),
    patient: '0x0000000000000000000000000000000000000000',
    version: '1.0',
    standard: 'medifund-v1-demo'
  };
};

export const getFileFromIPFS = async (hash: string): Promise<Blob | null> => {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await axios.get(`${gateway}${hash}`, {
        responseType: 'blob',
        timeout: 15000, // 15 second timeout for files
      });

      return response.data;
    } catch (error) {
      console.warn(`File gateway ${gateway} failed:`, error);
      continue;
    }
  }

  console.error('Failed to retrieve file from all IPFS gateways');
  return null;
};

export const isValidIPFSHash = (hash: string): boolean => {
  // Basic IPFS hash validation
  const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Regex = /^bafy[a-z2-7]{56}$/;
  
  return ipfsHashRegex.test(hash) || cidV1Regex.test(hash);
};

export const formatIPFSUrl = (hash: string, gateway: string = IPFS_GATEWAYS[0]): string => {
  if (!isValidIPFSHash(hash)) {
    throw new Error('Invalid IPFS hash provided');
  }
  
  return `${gateway}${hash}`;
};

// Utility function to convert IPFS URL to gateway URL
export const convertIPFSUrl = (ipfsUrl: string, gateway: string = IPFS_GATEWAYS[0]): string => {
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return formatIPFSUrl(hash, gateway);
  }
  
  return ipfsUrl;
};