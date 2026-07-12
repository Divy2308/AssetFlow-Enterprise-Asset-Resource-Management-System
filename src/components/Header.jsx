import React from 'react';
import { BellIcon, ChevronDownIcon } from './Icons';

export default function Header({ title = 'Screen 2', unreadCount = 3, userName = 'Aritra', onNotificationClick }) {
  return (
    <header className="main-header">
      {/* Title */}
      <h1 className="header-title">
        {title.split('  ')[0]}
        {title.split('  ')[1] && (
          <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-secondary)', marginLeft: '12px', verticalAlign: 'middle' }}>
            {title.split('  ')[1]}
          </span>
        )}
      </h1>

      {/* Top Right Controls */}
      <div className="header-actions">
        {/* Notification Button */}
        <button className="bell-btn" aria-label="Notifications" onClick={onNotificationClick}>
          <BellIcon size={20} />
          {unreadCount > 0 && (
            <span className="bell-badge">{unreadCount}</span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="profile-dropdown">
          <div className="profile-avatar">
            {userName.charAt(0)}
          </div>
          <span className="profile-name">{userName}</span>
          <ChevronDownIcon size={14} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}
