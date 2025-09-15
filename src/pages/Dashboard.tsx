import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Filter, Search, TrendingUp, Heart, DollarSign } from 'lucide-react';
import CampaignCard from '../components/CampaignCard';
import { useContract } from '../hooks/useContract';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { getActiveCampaigns, getCampaignData, getPatientCampaigns, getSponsorImpactNFTs } = useContract();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const [userImpactNFTs, setUserImpactNFTs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [address, isConnected]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all active campaigns
      const campaignIds = await getActiveCampaigns();
      const campaignData = await Promise.all(
        campaignIds.map(async (id: string) => {
          const data = await getCampaignData(id);
          return { id, ...data };
        })
      );
      setCampaigns(campaignData.filter(Boolean));

      // Load user-specific data if connected
      if (isConnected && address) {
        // Load user's campaigns
        const userCampaignIds = await getPatientCampaigns(address);
        const userCampaignData = await Promise.all(
          userCampaignIds.map(async (id: string) => {
            const data = await getCampaignData(id);
            return { id, ...data };
          })
        );
        setUserCampaigns(userCampaignData.filter(Boolean));

        // Load user's impact NFTs
        const impactNFTIds = await getSponsorImpactNFTs(address);
        setUserImpactNFTs(impactNFTIds);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    let matchesFilter = true;
    switch (filter) {
      case 'active':
        matchesFilter = campaign.isActive && !campaign.goalReached;
        break;
      case 'funded':
        matchesFilter = campaign.goalReached;
        break;
      case 'urgent':
        matchesFilter = campaign.urgency === 'high' || campaign.urgency === 'critical';
        break;
      case 'mine':
        matchesFilter = isConnected && campaign.patient === address;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Explore active campaigns and track your contributions</p>
        </div>

        {/* User Stats (if connected) */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Your Campaigns</p>
                  <p className="text-2xl font-bold">{userCampaigns.length}</p>
                </div>
                <Heart className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Impact NFTs</p>
                  <p className="text-2xl font-bold">{userImpactNFTs.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Funded</p>
                  <p className="text-2xl font-bold">
                    ${userCampaigns.reduce((sum, campaign) => sum + campaign.currentFunding, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-slate-500" />
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'funded', label: 'Funded' },
                  { key: 'urgent', label: 'Urgent' },
                  ...(isConnected ? [{ key: 'mine', label: 'My Campaigns' }] : [])
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === filterOption.key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-slate-200 rounded mb-4"></div>
                <div className="h-2 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {filter === 'all' ? 'All Campaigns' : 
                 filter === 'active' ? 'Active Campaigns' :
                 filter === 'funded' ? 'Successfully Funded' :
                 filter === 'urgent' ? 'Urgent Campaigns' :
                 filter === 'mine' ? 'Your Campaigns' : 'Campaigns'} 
                <span className="text-slate-500 ml-2">({filteredCampaigns.length})</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign, index) => (
                <CampaignCard key={campaign.id || index} campaign={campaign} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full p-8 w-fit mx-auto mb-4">
              <Heart className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No campaigns match your current filters'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                View All Campaigns
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;