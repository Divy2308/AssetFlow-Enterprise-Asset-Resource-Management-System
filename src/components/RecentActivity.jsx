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
        <strong>Room B2</strong> - booked by <span className="highlight">Manya Anand</span> - 2:00 to 3:00 PM
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
        <strong>Monitor AF-0091</strong> - Allocated to <span className="highlight">Elroy M</span>
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
        <strong>Chair CH-1022</strong> - returned by <span className="highlight">Chintan Varma</span>
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
        <strong>Keyboard KB-778</strong> - Allocated to <span className="highlight">Minty Fish</span>
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
        <strong>Conference Mic</strong> - booked by <span className="highlight">Cool Emu</span> - 11:00 AM
      </>
    ),
    time: 'Jul 9, 2025, 11:05 AM'
  }
];

export default function RecentActivity() {
  return (
    <div className="activity-section">
      <div className="activity-section-header">
        <h3 className="section-title" style={{ marginBottom: 0 }}>Recent Activity</h3>
        <a href="#view-all" className="view-all-link">
          View all <ChevronRightIcon size={14} className="view-all-chevron" />
        </a>
      </div>

      <div className="activity-card">
        <ul className="activity-list">
          {activitiesData.map((activity) => (
            <li key={activity.id} className="activity-item">
              <div className="activity-user-info">
                {/* Colored circle avatar */}
                <div className={`activity-avatar ${activity.avatarClass}`}>
                  {activity.initial}
                </div>
                
                {/* Description */}
                <div className="activity-details">
                  {activity.content}
                </div>
              </div>

              {/* Time indicator */}
              <div className="activity-time-wrap">
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
                  style={{ opacity: 0.7 }}
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
