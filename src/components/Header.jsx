import React from 'react';
import { BellIcon, ChevronDownIcon } from './Icons';

export default function Header({ title = 'Screen 2', notificationsCount = 3, userName = 'Aritra' }) {
  return (
    <header className="main-header">
      {/* Title */}
      <h1 className="header-title">{title}</h1>

      {/* Top Right Controls */}
      <div className="header-actions">
        {/* Notification Button */}
        <button className="bell-btn" aria-label="Notifications">
          <BellIcon size={20} />
          {notificationsCount > 0 && (
            <span className="bell-badge">{notificationsCount}</span>
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
