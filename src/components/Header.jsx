import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, ChevronDownIcon } from './Icons';

export default function Header({ title = 'Screen 2', unreadCount = 3, userName = 'Aritra', onNotificationClick, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center mb-6 pb-4 border-b border-border-color">
      {/* Title */}
      <h1 className="font-heading text-lg font-extrabold text-text-primary flex items-center">
        {title.split('  ')[0]}
        {title.split('  ')[1] && (
          <span className="text-sm font-medium text-text-secondary ml-3.5 align-middle">
            {title.split('  ')[1]}
          </span>
        )}
      </h1>

      {/* Top Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Button */}
        <button
          className="relative w-10 h-10 rounded-xl bg-white border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-all duration-200 cursor-pointer"
          aria-label="Notifications"
          onClick={onNotificationClick}
        >
          <BellIcon size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary-orange text-white text-[9px] font-extrabold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white border border-border-color py-1.5 pl-2 pr-3.5 rounded-xl cursor-pointer hover:bg-bg-gray transition-all duration-200 select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-primary-orange text-white flex items-center justify-center font-extrabold text-xs">
              {userName.charAt(0)}
            </div>
            <span className="text-sm font-bold text-text-primary">{userName}</span>
            <ChevronDownIcon size={12} className="text-text-secondary" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-border-color rounded-xl shadow-lg z-50 py-1.5">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (confirm('Are you sure you want to log out?')) {
                    onLogout();
                  }
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-extrabold text-alert-red-text hover:bg-red-50 transition-all text-left cursor-pointer"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="shrink-0"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
