import React from 'react';

export default function OverviewCard({ label, value, Icon, fillPercent = 60 }) {
  return (
    <div className="bg-white border border-border-color rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden h-[120px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Icon Container */}
      <div className="w-9 h-9 rounded-lg bg-primary-orange-light text-primary-orange flex items-center justify-center mb-2">
        <Icon size={20} />
      </div>

      {/* Info Content */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">{label}</span>
        <span className="text-2xl font-extrabold text-text-primary tracking-tight leading-none">{value}</span>
      </div>

      {/* Bottom Accent Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-bg-gray">
        <div 
          className="h-full bg-primary-orange transition-all duration-500" 
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}
