import React, { useState, useEffect } from 'react';
import OverviewCard from '../components/OverviewCard';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import { supabase } from '../config/supabaseClient';
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
  const [counts, setCounts] = useState({
    available: 0,
    allocated: 0,
    maintenance: 0,
    bookings: 0,
    transfers: 1,
    returns: 2
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Query assets status distribution
        const { data: assets } = await supabase.from('assets').select('status');
        let available = 0;
        let allocated = 0;
        let maintenance = 0;
        if (assets) {
          assets.forEach(a => {
            if (a.status === 'AVAILABLE') available++;
            else if (a.status === 'ALLOCATED') allocated++;
            else if (a.status === 'UNDER_MAINTENANCE') maintenance++;
          });
        }

        // Query active upcoming bookings count
        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'UPCOMING');

        setCounts({
          available,
          allocated,
          maintenance,
          bookings: bookingsCount || 0,
          transfers: 1,
          returns: 2
        });
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      }
    };

    fetchMetrics();
  }, []);

  // Metric card definitions based on real-time database counts
  const metrics = [
    { label: 'Available', value: counts.available.toString(), Icon: BoxIcon, fillPercent: counts.available > 0 ? Math.min(100, Math.round((counts.available / (counts.available + counts.allocated + counts.maintenance)) * 100)) : 0 },
    { label: 'Allocated', value: counts.allocated.toString(), Icon: ClipboardIcon, fillPercent: counts.allocated > 0 ? Math.min(100, Math.round((counts.allocated / (counts.available + counts.allocated + counts.maintenance)) * 100)) : 0 },
    { label: 'Maintenance', value: counts.maintenance.toString(), Icon: CheckCircleIcon, fillPercent: counts.maintenance > 0 ? Math.min(100, Math.round((counts.maintenance / (counts.available + counts.allocated + counts.maintenance)) * 100)) : 0 },
    { label: 'Active Bookings', value: counts.bookings.toString(), Icon: CalendarIcon, fillPercent: Math.min(100, counts.bookings * 15) },
    { label: 'Pending Transfers', value: counts.transfers.toString(), Icon: TransferIcon, fillPercent: 18 },
    { label: 'Upcoming returns', value: counts.returns.toString(), Icon: RefreshIcon, fillPercent: 42 }
  ];

  // Callback mock handlers for quick actions
  const handleRegisterAsset = () => alert('Please use the sidebar "Asset Register" menu to register items.');
  const handleBookResource = () => alert('Please use the sidebar "Resource Booking" menu to allocate timeslots.');
  const handleRaiseRequests = () => alert('Please use the sidebar "Maintenance" menu to raise requests.');

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
