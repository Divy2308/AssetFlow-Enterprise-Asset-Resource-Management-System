import React, { useState, useEffect } from 'react';
import { ChevronRightIcon } from './Icons';
import { supabase } from '../config/supabaseClient';

const colorMap = {
  'avatar-purple': 'bg-[#F5F3FF] text-[#8A5CF5]',
  'avatar-green': 'bg-[#ECFDF5] text-[#10B981]',
  'avatar-orange': 'bg-[#FFF4EF] text-[#FF5A1F]',
  'avatar-cyan': 'bg-[#ECFEFF] text-[#06B6D4]',
  'avatar-blue': 'bg-[#EFF6FF] text-[#3B82F6]'
};

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Query recent asset allocations
        const { data: allocations } = await supabase
          .from('allocation_history')
          .select('*, assets(tag, name)')
          .order('date', { ascending: false })
          .limit(5);

        // Query recent resource bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .order('id', { ascending: false })
          .limit(5);

        const merged = [];
        if (allocations) {
          allocations.forEach(a => {
            merged.push({
              id: `alloc-${a.id}`,
              initial: 'A',
              avatarClass: 'avatar-purple',
              content: (
                <>
                  <strong>{a.assets?.name || 'Asset'} {a.assets?.tag || ''}</strong> - {a.details}
                </>
              ),
              time: new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date(a.date).getTime()
            });
          });
        }
        if (bookings) {
          bookings.forEach(b => {
            merged.push({
              id: `book-${b.id}`,
              initial: 'B',
              avatarClass: 'avatar-green',
              content: (
                <>
                  <strong>{b.resource}</strong> - {b.title} ({b.time_str})
                </>
              ),
              time: b.booking_date,
              timestamp: new Date(b.booking_date).getTime()
            });
          });
        }

        // Sort combined array by timestamp descending
        merged.sort((x, y) => y.timestamp - x.timestamp);
        setActivities(merged.slice(0, 7));
      } catch (err) {
        console.error('Failed to load recent activities:', err);
      }
    };

    fetchActivities();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-heading text-base font-extrabold text-text-primary">Recent Activity</h3>
        <a href="#view-all" className="text-sm font-bold text-primary-orange hover:text-primary-orange-hover hover:underline flex items-center gap-1 transition-all">
          View all <ChevronRightIcon size={14} />
        </a>
      </div>

      <div className="bg-white border border-border-color rounded-2xl p-5 shadow-sm">
        <ul className="flex flex-col gap-4 p-0 m-0 list-none">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <li key={activity.id} className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-border-color last:border-b-0 last:pb-0">
                <div className="flex items-center gap-4">
                  {/* Colored circle avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${colorMap[activity.avatarClass] || 'bg-bg-gray text-text-secondary'}`}>
                    {activity.initial}
                  </div>
                  
                  {/* Description */}
                  <div className="text-sm text-text-primary font-medium">
                    {activity.content}
                  </div>
                </div>

                {/* Time indicator */}
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-70"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{activity.time}</span>
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm font-bold text-text-secondary text-center py-2">
              No recent activity recorded in database.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
