import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { DollarSign, Heart, Loader } from 'lucide-react';
import { useContract } from '../hooks/useContract';

interface FundingButtonProps {
  campaignId: string;
  onSuccess?: () => void;
}

const FundingButton: React.FC<FundingButtonProps> = ({ campaignId, onSuccess }) => {
  const { address, isConnected } = useAccount();
  const { contributeUSDC, contributeLIVES } = useContract();
  
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'USDC' | 'LIVES'>('USDC');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      const amountWei = parseFloat(amount) * 1e6; // Convert to 6 decimals for USDC/LIVES
      
      if (token === 'USDC') {
        await contributeUSDC(campaignId, amountWei.toString());
      } else {
        await contributeLIVES(campaignId, amountWei.toString());
      }

      // Reset form
      setAmount('');
      setShowForm(false);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      alert(`Successfully contributed ${amount} ${token}!`);
      
    } catch (error: any) {
      console.error('Error contributing:', error);
      
      // Handle specific error cases
      if (error.message.includes('insufficient allowance')) {
        alert(`Please approve ${token} spending first in your wallet`);
      } else if (error.message.includes('insufficient balance')) {
        alert(`Insufficient ${token} balance`);
      } else {
        alert('Failed to contribute. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center p-4 border border-slate-200 rounded-lg bg-slate-50">
        <p className="text-slate-600 text-sm">Connect your wallet to contribute</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <Heart className="h-5 w-5" />
        <span>Contribute Now</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleContribute} className="space-y-4">
      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Token
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setToken('USDC')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              token === 'USDC'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            USDC
          </button>
          <button
            type="button"
            onClick={() => setToken('LIVES')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              token === 'LIVES'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            $LIVES
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Amount ({token})
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex space-x-2">
        {[10, 25, 50, 100].map(quickAmount => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => setAmount(quickAmount.toString())}
            className="flex-1 py-2 px-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200"
          >
            ${quickAmount}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !amount}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Contributing...</span>
            </>
          ) : (
            <>
              <Heart className="h-4 w-4" />
              <span>Contribute {token}</span>
            </>
          )}
        </button>
      </div>

      {/* Note */}
      <p className="text-xs text-slate-500 text-center">
        You'll receive an Impact NFT when the campaign reaches its goal
      </p>
    </form>
  );
};

export default FundingButton;