
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  color?: 'blue' | 'teal' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  isPositive = true,
  subtext = 'vs last month',
  color = 'blue'
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition duration-200">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        {(change || subtext) && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {change && (
              <span className={`inline-flex items-center font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {change}
              </span>
            )}
            {subtext && <span className="text-slate-400 font-normal">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
