import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Upload, FileText, DollarSign, Heart } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { uploadToIPFS } from '../utils/pinata';

const CreateCampaign = () => {
  const { address, isConnected } = useAccount();
  const { createCampaign } = useContract();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    treatmentDetails: '',
    medicalDocuments: null as File[] | null,
    patientAge: '',
    diagnosis: '',
    urgency: 'medium'
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        medicalDocuments: Array.from(e.target.files!)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(25);

      // Prepare metadata for IPFS
      const metadata = {
        title: formData.title,
        description: formData.description,
        treatmentDetails: formData.treatmentDetails,
        patientAge: formData.patientAge,
        diagnosis: formData.diagnosis,
        urgency: formData.urgency,
        createdAt: new Date().toISOString(),
        patient: address
      };

      setUploadProgress(50);

      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(metadata, formData.medicalDocuments);
      
      setUploadProgress(75);

      // Create campaign on blockchain
      const fundingGoalWei = parseFloat(formData.fundingGoal) * 1e6; // Convert to USDC format
      await createCampaign(fundingGoalWei.toString(), ipfsHash);

      setUploadProgress(100);

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-100 rounded-full p-8 w-fit mx-auto mb-4">
            <Heart className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Wallet</h2>
          <p className="text-slate-600">Please connect your wallet to create a campaign</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Sponsorship Campaign</h1>
          <p className="text-slate-600 mt-2">Share your story and treatment needs with potential sponsors</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Campaign Details</h2>
            <p className="text-blue-100 mt-1">All information will be stored securely on IPFS</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Help Sarah Access Gene Therapy Treatment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Funding Goal (USDC) *
                </label>
                <input
                  type="number"
                  name="fundingGoal"
                  value={formData.fundingGoal}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="25000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Share your story and why you need this treatment..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Patient Age
                </label>
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="35"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low - Treatment can wait</option>
                  <option value="medium">Medium - Treatment needed soon</option>
                  <option value="high">High - Urgent treatment required</option>
                  <option value="critical">Critical - Life threatening</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Medical condition or diagnosis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Treatment Details *
              </label>
              <textarea
                name="treatmentDetails"
                value={formData.treatmentDetails}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Describe the specific treatment, procedures, or therapy needed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Medical Documents
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload files
                  </span>
                  <p className="text-slate-500 text-sm mt-1">
                    Medical reports, doctor's notes, etc. (PDF, Images, Documents)
                  </p>
                </label>
                {formData.medicalDocuments && (
                  <div className="mt-3 text-sm text-slate-600">
                    {formData.medicalDocuments.length} file(s) selected
                  </div>
                )}
              </div>
            </div>

            {loading && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">Creating Campaign...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-blue-600 text-sm mt-1">{uploadProgress}% complete</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                * Required fields
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;