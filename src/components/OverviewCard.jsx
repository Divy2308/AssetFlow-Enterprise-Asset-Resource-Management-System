import React from 'react';

export default function OverviewCard({ label, value, Icon, fillPercent = 60 }) {
  return (
    <div className="overview-card">
      {/* Icon Container */}
      <div className="overview-icon-container">
        <Icon size={24} />
      </div>

      {/* Info Content */}
      <div className="overview-info">
        <span className="overview-label">{label}</span>
        <span className="overview-value">{value}</span>
      </div>

      {/* Bottom Accent Bar */}
      <div className="overview-bar">
        <div 
          className="overview-bar-fill" 
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}
