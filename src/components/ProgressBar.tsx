import React from 'react';

interface ProgressBarProps {
  current: number;
  goal: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, goal, className = '' }) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  
  return (
    <div className={`w-full bg-slate-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      >
        <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default ProgressBar;