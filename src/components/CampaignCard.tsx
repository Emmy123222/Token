import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, DollarSign, Users, Clock, CheckCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { getFromIPFS } from '../utils/ipfs';

interface CampaignCardProps {
  campaign: any;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaign?.ipfsHash) {
      loadMetadata();
    } else {
      setLoading(false);
    }
  }, [campaign]);

  const loadMetadata = async () => {
    try {
      const data = await getFromIPFS(campaign.ipfsHash);
      setMetadata(data);
    } catch (error) {
      console.error('Error loading metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const progressPercentage = campaign?.fundingGoal > 0 ? (campaign.currentFunding / campaign.fundingGoal) * 100 : 0;
  const timeAgo = campaign?.createdAt ? Math.floor((Date.now() / 1000 - campaign.createdAt) / (24 * 60 * 60)) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-20 bg-slate-200 rounded mb-4"></div>
        <div className="h-2 bg-slate-200 rounded mb-2"></div>
        <div className="h-8 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
            {metadata?.title || 'Medical Treatment Campaign'}
          </h3>
          {campaign?.goalReached && (
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
          )}
        </div>

        <div className="flex items-center space-x-3 text-sm text-slate-600 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{timeAgo} days ago</span>
          </div>
          {metadata?.urgency && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(metadata.urgency)}`}>
              {metadata.urgency.toUpperCase()}
            </span>
          )}
        </div>

        <p className="text-slate-700 text-sm line-clamp-3 mb-4">
          {metadata?.description || 'Help support this medical treatment campaign.'}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-900">
              ${campaign?.currentFunding?.toLocaleString() || '0'}
            </span>
            <span className="text-sm text-slate-600">
              of ${campaign?.fundingGoal?.toLocaleString() || '0'}
            </span>
          </div>
          <ProgressBar 
            current={campaign?.currentFunding || 0} 
            goal={campaign?.fundingGoal || 1} 
          />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{campaign?.sponsors?.length || 0} sponsors</span>
            </div>
            <span>{progressPercentage.toFixed(1)}% funded</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            {metadata?.diagnosis && (
              <span className="truncate">{metadata.diagnosis}</span>
            )}
            {metadata?.patientAge && (
              <span>{metadata.patientAge} years old</span>
            )}
          </div>

          <Link
            to={`/campaign/${campaign.id}`}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              campaign?.goalReached 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
            }`}
          >
            {campaign?.goalReached ? 'View Details' : 'Support Now'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;