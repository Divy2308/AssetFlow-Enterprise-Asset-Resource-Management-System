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
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-border-color rounded-2xl max-w-2xl mx-auto shadow-sm gap-4 my-8">
      <div className="w-20 h-20 rounded-2xl bg-primary-orange-light text-primary-orange flex items-center justify-center shrink-0">
        <IconComponent size={40} strokeWidth={1.8} />
      </div>
      <h2 className="font-heading text-lg font-extrabold text-text-primary">{title} Component</h2>
      <p className="text-xs font-semibold text-text-secondary leading-relaxed max-w-md m-0">
        This is a modular standalone component representing the <strong>{title}</strong> workspace. 
        All sub-actions, details, and operations for {title.toLowerCase()} will reside here.
      </p>
    </div>
  );
}
