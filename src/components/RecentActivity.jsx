import React from 'react';
import { ChevronRightIcon } from './Icons';

const activitiesData = [
  {
    id: 1,
    initial: 'M',
    avatarClass: 'avatar-purple',
    content: (
      <>
        <strong>Laptop AF-0123</strong> - Allocated to Priya
      </>
    ),
    time: 'Today, 11:45 AM'
  },
  {
    id: 2,
    initial: 'D',
    avatarClass: 'avatar-green',
    content: (
      <>
        <strong>Room B2</strong> - booked by <span className="font-bold">Manya Anand</span> - 2:00 to 3:00 PM
      </>
    ),
    time: 'Today, 10:30 AM'
  },
  {
    id: 3,
    initial: 'P',
    avatarClass: 'avatar-orange',
    content: (
      <>
        <strong>Projector AF-0062</strong> - maintenance completed
      </>
    ),
    time: 'Yesterday, 4:20 PM'
  },
  {
    id: 4,
    initial: 'M',
    avatarClass: 'avatar-cyan',
    content: (
      <>
        <strong>Monitor AF-0091</strong> - Allocated to <span className="font-bold">Elroy M</span>
      </>
    ),
    time: 'Yesterday, 2:10 PM'
  },
  {
    id: 5,
    initial: 'C',
    avatarClass: 'avatar-blue',
    content: (
      <>
        <strong>Chair CH-1022</strong> - returned by <span className="font-bold">Chintan Varma</span>
      </>
    ),
    time: 'Jul 9, 2025, 5:15 PM'
  },
  {
    id: 6,
    initial: 'M',
    avatarClass: 'avatar-green',
    content: (
      <>
        <strong>Keyboard KB-778</strong> - Allocated to <span className="font-bold">Minty Fish</span>
      </>
    ),
    time: 'Jul 9, 2025, 3:40 PM'
  },
  {
    id: 7,
    initial: 'C',
    avatarClass: 'avatar-purple',
    content: (
      <>
        <strong>Conference Mic</strong> - booked by <span className="font-bold">Cool Emu</span> - 11:00 AM
      </>
    ),
    time: 'Jul 9, 2025, 11:05 AM'
  }
];

const colorMap = {
  'avatar-purple': 'bg-[#F5F3FF] text-[#8A5CF5]',
  'avatar-green': 'bg-[#ECFDF5] text-[#10B981]',
  'avatar-orange': 'bg-[#FFF4EF] text-[#FF5A1F]',
  'avatar-cyan': 'bg-[#ECFEFF] text-[#06B6D4]',
  'avatar-blue': 'bg-[#EFF6FF] text-[#3B82F6]'
};

export default function RecentActivity() {
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
          {activitiesData.map((activity) => (
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
          ))}
        </ul>
      </div>
    </div>
  );
}
