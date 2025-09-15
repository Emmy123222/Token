import axios from 'axios';
import { PINATA_API_KEY, PINATA_SECRET_API_KEY, PINATA_JWT } from './constants';

const pinataApiUrl = 'https://api.pinata.cloud';

// Initialize Pinata client
const pinataClient = axios.create({
  baseURL: pinataApiUrl,
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_API_KEY,
    'Authorization': `Bearer ${PINATA_JWT}`,
  },
});

export interface CampaignMetadata {
  title: string;
  description: string;
  treatmentDetails: string;
  patientAge?: string;
  diagnosis?: string;
  urgency: string;
  createdAt: string;
  patient: string;
}

export const uploadToIPFS = async (
  metadata: CampaignMetadata,
  files?: File[] | null
): Promise<string> => {
  try {
    let fileHashes: string[] = [];

    // Upload files first if they exist
    if (files && files.length > 0) {
      fileHashes = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const fileMetadata = {
            name: file.name,
            keyvalues: {
              type: 'medical_document',
              campaignId: 'temp', // Will be updated with actual campaign ID
            }
          };
          
          formData.append('pinataMetadata', JSON.stringify(fileMetadata));
          
          const response = await pinataClient.post('/pinning/pinFileToIPFS', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          return response.data.IpfsHash;
        })
      );
    }

    // Create complete metadata object
    const completeMetadata = {
      ...metadata,
      files: fileHashes,
      version: '1.0',
      standard: 'medifund-v1',
    };

    // Upload metadata JSON
    const response = await pinataClient.post('/pinning/pinJSONToIPFS', completeMetadata, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Uploaded to IPFS:', response.data.IpfsHash);
    return response.data.IpfsHash;

  } catch (error) {
    console.error('❌ Error uploading to IPFS:', error);
    
    // Fallback: create a simple hash for demo purposes
    if (!PINATA_JWT || !PINATA_API_KEY) {
      console.warn('⚠️ Pinata credentials not configured, using demo hash');
      const demoHash = 'Qm' + btoa(JSON.stringify(metadata)).slice(0, 44);
      
      // Store in localStorage for demo
      localStorage.setItem(`ipfs_${demoHash}`, JSON.stringify({
        ...metadata,
        files: [],
        version: '1.0',
        standard: 'medifund-v1-demo'
      }));
      
      return demoHash;
    }
    
    throw new Error('Failed to upload to IPFS');
  }
};

export const getFileFromIPFS = async (hash: string): Promise<File | null> => {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`, {
      responseType: 'blob',
    });

    const blob = response.data;
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const filename = hash.slice(-10); // Use last 10 chars of hash as filename

    return new File([blob], filename, { type: contentType });
  } catch (error) {
    console.error('Error fetching file from IPFS:', error);
    return null;
  }
};

export const pinJSONToIPFS = async (jsonData: any): Promise<string> => {
  try {
    const response = await pinataClient.post('/pinning/pinJSONToIPFS', jsonData);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error);
    throw error;
  }
};

export const pinFileToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await pinataClient.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw error;
  }
};

// Test Pinata connection
export const testPinataConnection = async (): Promise<boolean> => {
  try {
    await pinataClient.get('/data/testAuthentication');
    console.log('✅ Pinata connection successful');
    return true;
  } catch (error) {
    console.error('❌ Pinata connection failed:', error);
    return false;
  }
};