import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Heart, DollarSign, Users, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { getFromIPFS } from '../utils/ipfs';
import FundingButton from '../components/FundingButton';
import ProgressBar from '../components/ProgressBar';

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected } = useAccount();
  const { getCampaignData, getSponsorContribution } = useContract();

  const [campaign, setCampaign] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userContribution, setUserContribution] = useState(0);

  useEffect(() => {
    if (id) {
      loadCampaignDetails();
    }
  }, [id, address]);

  const loadCampaignDetails = async () => {
    try {
      setLoading(true);
      
      // Get campaign data from contract
      const campaignData = await getCampaignData(id!);
      setCampaign(campaignData);

      // Get metadata from IPFS
      if (campaignData?.ipfsHash) {
        const ipfsData = await getFromIPFS(campaignData.ipfsHash);
        setMetadata(ipfsData);
      }

      // Get user's contribution if connected
      if (isConnected && address) {
        const contribution = await getSponsorContribution(id!, address);
        setUserContribution(contribution);
      }

    } catch (error) {
      console.error('Error loading campaign details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="h-40 bg-slate-200 rounded mb-6"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="h-6 bg-slate-200 rounded mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Campaign Not Found</h2>
          <p className="text-slate-600">The campaign you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (campaign.currentFunding / campaign.fundingGoal) * 100;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {metadata?.title || 'Medical Treatment Campaign'}
          </h1>
          <div className="flex items-center space-x-4 text-slate-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(campaign.createdAt * 1000).toLocaleDateString()}</span>
            </div>
            {metadata?.urgency && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(metadata.urgency)}`}>
                {metadata.urgency.toUpperCase()} URGENCY
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Progress Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Funding Progress</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${campaign.currentFunding.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">
                      of ${campaign.fundingGoal.toLocaleString()} goal
                    </div>
                  </div>
                </div>
                <ProgressBar current={campaign.currentFunding} goal={campaign.fundingGoal} />
                <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
                  <span>{campaign.sponsors?.length || 0} sponsors</span>
                  <span>{progressPercentage.toFixed(1)}% funded</span>
                </div>
              </div>

              {/* Campaign Story */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Story</h3>
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {metadata?.description || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Treatment Details */}
              {metadata?.treatmentDetails && (
                <div className="p-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Treatment Details
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {metadata.treatmentDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* Medical Information */}
              {(metadata?.diagnosis || metadata?.patientAge) && (
                <div className="p-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Medical Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {metadata?.diagnosis && (
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Diagnosis</dt>
                        <dd className="text-slate-900">{metadata.diagnosis}</dd>
                      </div>
                    )}
                    {metadata?.patientAge && (
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Patient Age</dt>
                        <dd className="text-slate-900">{metadata.patientAge} years old</dd>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Support This Campaign</h3>
              
              {campaign.goalReached ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">Goal Reached! 🎉</p>
                  <p className="text-green-700 text-sm mt-1">
                    This campaign has successfully reached its funding goal.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      ${(campaign.fundingGoal - campaign.currentFunding).toLocaleString()}
                    </div>
                    <div className="text-slate-600 text-sm">still needed</div>
                  </div>
                  
                  <FundingButton campaignId={id!} onSuccess={loadCampaignDetails} />
                  
                  {userContribution > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-blue-800 text-sm">
                        You've contributed <span className="font-semibold">${userContribution.toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Raised</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${campaign.currentFunding.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Sponsors</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {campaign.sponsors?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Progress</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Share Campaign */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Share this campaign</h3>
              <p className="text-blue-100 text-sm mb-4">
                Help spread the word and reach more potential sponsors
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full"
              >
                Copy Campaign Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;