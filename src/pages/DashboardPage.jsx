import React from 'react';
import OverviewCard from '../components/OverviewCard';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import { 
  BoxIcon, 
  ClipboardIcon, 
  CheckCircleIcon, 
  CalendarIcon, 
  TransferIcon, 
  RefreshIcon,
  AlertTriangleIcon,
  ChevronRightIcon
} from '../components/Icons';

export default function DashboardPage() {
  // Metric card definitions based on mockup data
  const metrics = [
    { label: 'Available', value: '128', Icon: BoxIcon, fillPercent: 78 },
    { label: 'Allocated', value: '76', Icon: ClipboardIcon, fillPercent: 55 },
    { label: 'Available', value: '4', Icon: CheckCircleIcon, fillPercent: 12 }, // Card 3: green Check circle "Available 4"
    { label: 'Active Bookings', value: '9', Icon: CalendarIcon, fillPercent: 32 },
    { label: 'Pending Transfers', value: '3', Icon: TransferIcon, fillPercent: 18 },
    { label: 'Upcoming returns', value: '12', Icon: RefreshIcon, fillPercent: 42 }
  ];

  // Callback mock handlers for quick actions
  const handleRegisterAsset = () => alert('Opening "Register Asset" flow...');
  const handleBookResource = () => alert('Opening "Book Resource" calendar...');
  const handleRaiseRequests = () => alert('Opening "Raise Request" dialog...');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Today's Overview Grid */}
      <section className="overview-section">
        <h2 className="section-title">Today's Overview</h2>
        <div className="overview-grid">
          {metrics.map((m, idx) => (
            <OverviewCard
              key={idx}
              label={m.label}
              value={m.value}
              Icon={m.Icon}
              fillPercent={m.fillPercent}
            />
          ))}
        </div>
      </section>

      {/* 2. Alert/Warning Banner */}
      <div className="alert-banner">
        <div className="alert-message-wrap">
          <div className="alert-icon-box">
            <AlertTriangleIcon size={22} strokeWidth={2} />
          </div>
          <span className="alert-text">
            3 assets overdue for return - flagged for follow-up
          </span>
        </div>
        <a href="#view-overdue" className="alert-link">
          View details <ChevronRightIcon size={14} />
        </a>
      </div>

      {/* 3. Quick Action Buttons */}
      <QuickActions
        onRegisterAsset={handleRegisterAsset}
        onBookResource={handleBookResource}
        onRaiseRequests={handleRaiseRequests}
      />

      {/* 4. Recent Activity Feed */}
      <RecentActivity />

    </div>
  );
}
