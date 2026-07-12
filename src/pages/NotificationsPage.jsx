import React, { useState } from 'react';
import {
  CalendarIcon,
  InfoIcon,
  LaptopIcon,
  WrenchIcon,
  TransferIcon,
  ClockIcon,
  ShieldIcon,
  BoxIcon,
  SlidersIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '../components/Icons';

export default function NotificationsPage({ notifications = [], setNotifications }) {
  // 1. Filter Category State
  const [activeCategory, setActiveCategory] = useState('All');

  // 2. Search Query State
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Pagination Page State
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to resolve card icon components
  const getCategoryIcon = (type) => {
    switch (type) {
      case 'laptop': return LaptopIcon;
      case 'wrench': return WrenchIcon;
      case 'calendar': return CalendarIcon;
      case 'transfer': return TransferIcon;
      case 'clock': return ClockIcon;
      case 'shield': return ShieldIcon;
      default: return BoxIcon;
    }
  };

  // Filter & Search Logic
  const filteredNotifications = notifications.filter((item) => {
    // A. Category Tab Filter
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Approvals' && item.category === 'approvals') ||
      (activeCategory === 'Bookings' && item.category === 'bookings') ||
      (activeCategory === 'Transfers' && item.category === 'transfers');

    // B. Search keyword filter (case insensitive)
    const matchesSearch =
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtext && item.subtext.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Mark notification as read
  const handleCardClick = (id) => {
    if (!setNotifications) return;
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const getBadgeColors = (bgColor) => {
    switch (bgColor) {
      case 'purple': return 'bg-[#F5F3FF] text-[#8A5CF5]';
      case 'blue': return 'bg-[#EFF6FF] text-[#3B82F6]';
      case 'green': return 'bg-[#ECFDF5] text-[#10B981]';
      case 'orange': return 'bg-[#FFF4EF] text-[#FF5A1F]';
      default: return 'bg-bg-gray text-text-secondary';
    }
  };

  const getDotColors = (dotColor) => {
    switch (dotColor) {
      case 'purple': return 'bg-[#8A5CF5]';
      case 'blue': return 'bg-[#3B82F6]';
      case 'green': return 'bg-[#10B981]';
      default: return 'bg-primary-orange';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Header Filter Pill Actions & Search controls */}
      <div className="flex justify-between items-center gap-4 flex-nowrap overflow-x-auto pb-1 mt-[-16px]">
        
        {/* Left Side: Filter Tabs */}
        <div className="flex gap-1.5 bg-bg-gray border border-border-color p-1 rounded-xl shrink-0">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition duration-200 cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-white text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => {
              setActiveCategory('All');
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition duration-200 cursor-pointer ${
              activeCategory === 'Approvals'
                ? 'bg-white text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => {
              setActiveCategory('Approvals');
              setCurrentPage(1);
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A5CF5]" />
            Approvals
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition duration-200 cursor-pointer ${
              activeCategory === 'Bookings'
                ? 'bg-white text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => {
              setActiveCategory('Bookings');
              setCurrentPage(1);
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            Bookings
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition duration-200 cursor-pointer ${
              activeCategory === 'Transfers'
                ? 'bg-white text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => {
              setActiveCategory('Transfers');
              setCurrentPage(1);
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Transfers
          </button>
        </div>

        {/* Right Side: Search input */}
        <div className="shrink-0">
          <div className="relative w-60 h-10">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary flex items-center">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full h-full border border-border-color bg-white pl-10 pr-4 rounded-xl text-xs font-bold focus:outline-none focus:border-primary-orange text-text-primary placeholder:text-text-muted"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Notifications Feed list */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const CardIcon = getCategoryIcon(item.type);
            return (
              <div
                key={item.id}
                className="bg-white border border-border-color rounded-2xl p-4.5 shadow-xs flex justify-between items-center gap-4 cursor-pointer hover:shadow-sm transition-all duration-200 text-left"
                onClick={() => handleCardClick(item.id)}
              >
                {/* Left Section (Icon avatar, colored category dot, description labels) */}
                <div className="flex items-center gap-4">
                  {/* Category icon avatar container */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getBadgeColors(item.bgColor)}`}>
                    <CardIcon size={16} />
                  </div>

                  {/* Message details */}
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getDotColors(item.dotColor)}`} />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-extrabold text-text-primary">{item.text}</span>
                      {item.subtext && (
                        <span className="text-[11px] text-text-secondary font-semibold mt-0.5">
                          {item.subtext}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section (Relative timestamp, orange unread status badge) */}
                <div className="flex items-center">
                  <span className="text-xs font-bold text-text-secondary min-w-[65px] text-right">{item.time}</span>
                  {item.isUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-orange ml-3.5 shrink-0" title="Unread notification" />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-border-color rounded-2xl text-center gap-2">
            <InfoIcon size={32} className="text-text-muted mb-1" />
            <p className="text-xs font-extrabold text-text-secondary m-0">
              No notifications found matching the active criteria.
            </p>
          </div>
        )}
      </div>

      {/* 3. Pagination controls */}
      <div className="flex justify-between items-center text-xs font-bold text-text-secondary p-4 border-t border-border-color flex-wrap gap-4 mt-1">
        <span>
          Showing 1 to {filteredNotifications.length} of {filteredNotifications.length} notifications
        </span>

        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 list-none m-0 p-0">
            <button className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center transition cursor-pointer text-xs font-extrabold text-text-secondary hover:bg-bg-gray hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed" disabled>
              <ChevronLeftIcon size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer text-xs font-extrabold bg-primary-orange-light text-primary-orange border-primary-orange-border/30">1</button>
            <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer text-xs font-extrabold border-transparent hover:bg-bg-gray text-text-secondary hover:text-text-primary">2</button>
            <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer text-xs font-extrabold border-transparent hover:bg-bg-gray text-text-secondary hover:text-text-primary">3</button>
            <button className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center transition cursor-pointer text-xs font-extrabold text-text-secondary hover:bg-bg-gray hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed" disabled>
              <ChevronRightIcon size={14} />
            </button>
          </div>

          <div className="relative w-28">
            <select className="w-full border border-border-color bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-text-primary focus:outline-none focus:border-primary-orange appearance-none pr-7 cursor-pointer">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
            <span className="absolute right-2.5 top-2.5 text-text-secondary pointer-events-none">
              <ChevronDownIcon size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Alert Disclaimer Banner with Bell illustration */}
      <div className="bg-gradient-to-r from-primary-orange-light to-[#FFF9F6] border border-primary-orange-border/20 rounded-2xl p-4.5 flex justify-between items-center gap-4 flex-wrap text-left">
        <div className="flex items-center gap-3">
          <div className="text-primary-orange flex items-center shrink-0">
            <InfoIcon size={20} strokeWidth={2.4} />
          </div>
          <p className="text-xs font-semibold text-primary-orange leading-relaxed m-0">
            Notifications help you stay on top of important activities and never miss an update.
          </p>
        </div>

        {/* 3D-like Bell drawing decorator with badge */}
        <div className="relative flex items-center mr-3 opacity-90">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary-orange)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-primary-orange text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
            3
          </span>
        </div>
      </div>

    </div>
  );
}
