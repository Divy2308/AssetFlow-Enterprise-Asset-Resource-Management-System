import React from 'react';
import * as Icons from '../components/Icons';

export default function PlaceholderPage({ title, id }) {
  // Select a relevant icon to render based on the current page identifier
  let IconComponent = Icons.BoxIcon;
  
  if (id === 'org-setup') IconComponent = Icons.OrgSetupIcon;
  else if (id === 'assets') IconComponent = Icons.AssetsIcon;
  else if (id === 'allocation') IconComponent = Icons.TransferIcon;
  else if (id === 'booking') IconComponent = Icons.CalendarIcon;
  else if (id === 'maintenance') IconComponent = Icons.WrenchIcon;
  else if (id === 'audit') IconComponent = Icons.ShieldIcon;
  else if (id === 'reports') IconComponent = Icons.ReportsIcon;
  else if (id === 'notifications') IconComponent = Icons.BellIcon;

  return (
    <div className="placeholder-container">
      <div className="placeholder-icon">
        <IconComponent size={64} strokeWidth={1.5} />
      </div>
      <h2 className="placeholder-title">{title} Component</h2>
      <p className="placeholder-desc">
        This is a modular standalone component representing the <strong>{title}</strong> workspace. 
        All sub-actions, details, and operations for {title.toLowerCase()} will reside here.
      </p>
    </div>
  );
}
