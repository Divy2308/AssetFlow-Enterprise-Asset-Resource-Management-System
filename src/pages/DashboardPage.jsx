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
    { label: 'Available', value: '4', Icon: CheckCircleIcon, fillPercent: 12 },
    { label: 'Active Bookings', value: '9', Icon: CalendarIcon, fillPercent: 32 },
    { label: 'Pending Transfers', value: '3', Icon: TransferIcon, fillPercent: 18 },
    { label: 'Upcoming returns', value: '12', Icon: RefreshIcon, fillPercent: 42 }
  ];

  // Callback mock handlers for quick actions
  const handleRegisterAsset = () => alert('Opening "Register Asset" flow...');
  const handleBookResource = () => alert('Opening "Book Resource" calendar...');
  const handleRaiseRequests = () => alert('Opening "Raise Request" dialog...');

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Today's Overview Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-base font-extrabold text-text-primary">Today's Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
      <div className="bg-alert-red-bg border border-alert-red-border/60 rounded-2xl p-4 flex justify-between items-center flex-wrap gap-4 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-alert-red-text flex items-center justify-center shrink-0">
            <AlertTriangleIcon size={18} strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-alert-red-text">
            3 assets overdue for return - flagged for follow-up
          </span>
        </div>
        <a href="#view-overdue" className="text-sm font-bold text-alert-red-text hover:underline flex items-center gap-1 transition-all shrink-0">
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
