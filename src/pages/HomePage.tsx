import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';
import CampaignCard from '../components/CampaignCard';
import { useContract } from '../hooks/useContract';

const HomePage = () => {
  const { getActiveCampaigns, getCampaignData } = useContract();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalFunded: 0,
    totalSponsors: 0,
    successRate: 0
  });

  useEffect(() => {
    loadActiveCampaigns();
  }, []);

  const loadActiveCampaigns = async () => {
    try {
      setLoading(true);
      const campaignIds = await getActiveCampaigns();
      const campaignData = await Promise.all(
        campaignIds.map(async (id: string) => {
          const data = await getCampaignData(id);
          return data;
        })
      );
      setCampaigns(campaignData.filter(Boolean));
      
      // Calculate stats
      const totalFunded = campaignData.reduce((sum, campaign) => sum + (campaign?.currentFunding || 0), 0);
      const completedCampaigns = campaignData.filter(campaign => campaign?.goalReached).length;
      
      setStats({
        totalCampaigns: campaignData.length,
        totalFunded,
        totalSponsors: campaignData.reduce((sum, campaign) => sum + (campaign?.sponsors?.length || 0), 0),
        successRate: campaignData.length > 0 ? (completedCampaigns / campaignData.length) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tokenized Patient <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Sponsorship Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Bridge the gap between patients who need experimental treatments and 
              global communities willing to help through transparent Web3 sponsorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create Campaign
              </Link>
              <Link
                to="/dashboard"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-white/20"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl w-fit mx-auto mb-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalCampaigns}</div>
              <div className="text-slate-600">Active Campaigns</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl w-fit mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-900">${stats.totalFunded.toLocaleString()}</div>
              <div className="text-slate-600">Total Funded</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalSponsors}</div>
              <div className="text-slate-600">Total Sponsors</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.successRate.toFixed(1)}%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Campaigns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Campaigns</h2>
            <p className="text-slate-600 mt-2">Help patients access life-changing treatments</p>
          </div>
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-slate-200 rounded mb-4"></div>
                <div className="h-2 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 6).map((campaign, index) => (
              <CampaignCard key={index} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full p-8 w-fit mx-auto mb-4">
              <Plus className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h3>
            <p className="text-slate-600 mb-6">Be the first to create a sponsorship campaign</p>
            <Link
              to="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Create First Campaign
            </Link>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-600 mt-2">Simple, transparent, and secure Web3 sponsorship</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-2xl w-fit mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">1. Create Campaign</h3>
              <p className="text-slate-600">Patients create sponsorship requests with treatment details and funding goals. Data is stored on IPFS for transparency.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl w-fit mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">2. Sponsors Fund</h3>
              <p className="text-slate-600">Global sponsors contribute USDC or $LIVES tokens. All funding is transparent and verifiable on-chain.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">3. Receive Impact NFTs</h3>
              <p className="text-slate-600">When goals are reached, sponsors automatically receive soulbound Impact NFTs as proof of their contribution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;