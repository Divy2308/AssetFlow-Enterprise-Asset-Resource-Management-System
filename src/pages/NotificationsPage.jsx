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
  ChevronRightIcon
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Filter Pill Actions & Search controls */}
      <div className="notification-filters-row">
        
        {/* Left Side: Filter Tabs */}
        <div className="filter-tabs-group">
          <button
            className={`notification-filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('All');
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`notification-filter-btn ${activeCategory === 'Approvals' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('Approvals');
              setCurrentPage(1);
            }}
          >
            <span className="filter-dot purple" />
            Approvals
          </button>
          <button
            className={`notification-filter-btn ${activeCategory === 'Bookings' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('Bookings');
              setCurrentPage(1);
            }}
          >
            <span className="filter-dot blue" />
            Bookings
          </button>
          <button
            className={`notification-filter-btn ${activeCategory === 'Transfers' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('Transfers');
              setCurrentPage(1);
            }}
          >
            <span className="filter-dot green" />
            Transfers
          </button>
        </div>

        {/* Right Side: Search and Slider drawer button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="search-container" style={{ width: '240px', height: '42px', margin: 0 }}>
            <span className="search-icon-wrapper" style={{ top: '11px' }}>
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Search notifications..."
              className="search-input-field"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ height: '42px', fontSize: '13px' }}
            />
          </div>

          <button 
            className="btn-outline-orange"
            style={{ height: '42px', padding: '0 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
            onClick={() => alert('Search filters menu triggered')}
          >
            <SlidersIcon size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* 2. Notifications Feed list */}
      <div className="notifications-feed">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const CardIcon = getCategoryIcon(item.type);
            return (
              <div
                key={item.id}
                className="notification-row-card"
                onClick={() => handleCardClick(item.id)}
              >
                {/* Left Section (Icon avatar, colored category dot, description labels) */}
                <div className="notification-cell-left">
                  {/* Category icon avatar container */}
                  <div className={`card-icon-box ${item.bgColor}`}>
                    <CardIcon size={16} />
                  </div>

                  {/* Message details */}
                  <div className="notification-cell-center">
                    <span className={`category-indicator-dot ${item.dotColor}`} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="notification-card-text">{item.text}</span>
                      {item.subtext && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '2px' }}>
                          {item.subtext}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section (Relative timestamp, orange unread status badge) */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="notification-card-time">{item.time}</span>
                  {item.isUnread && (
                    <span className="unread-dot-indicator" title="Unread notification" />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div 
            className="card-empty-state" 
            style={{ 
              padding: '48px', 
              textAlign: 'center', 
              backgroundColor: 'var(--bg-white)', 
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}
          >
            <InfoIcon size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', margin: 0 }}>
              No notifications found matching the active criteria.
            </p>
          </div>
        )}
      </div>

      {/* 3. Pagination controls */}
      <div className="pagination-row">
        <span className="pagination-left-info">
          Showing 1 to {filteredNotifications.length} of {filteredNotifications.length} notifications
        </span>

        <div className="pagination-controls-right">
          <div className="pagination-pages-list">
            <button className="pagination-btn" disabled>
              <ChevronLeftIcon size={14} />
            </button>
            <button className="pagination-number active">1</button>
            <button className="pagination-number">2</button>
            <button className="pagination-number">3</button>
            <button className="pagination-btn" disabled>
              <ChevronRightIcon size={14} />
            </button>
          </div>

          <div className="icon-select-input" style={{ width: '110px' }}>
            <select style={{ height: '36px', padding: '0 30px 0 12px', fontSize: '12px', fontWeight: '700' }}>
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
            <span className="select-chevron-right" style={{ right: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Alert Disclaimer Banner with Bell illustration */}
      <div 
        className="info-banner" 
        style={{ 
          marginTop: '8px', 
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, var(--primary-orange-light) 0%, #FFF9F6 100%)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="info-banner-icon">
            <InfoIcon size={20} strokeWidth={2.4} />
          </div>
          <p className="info-banner-text">
            Notifications help you stay on top of important activities and never miss an update.
          </p>
        </div>

        {/* 3D-like Bell drawing decorator with badge */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '16px', opacity: 0.9 }}>
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
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              backgroundColor: 'var(--primary-orange)',
              color: 'white',
              fontSize: '9px',
              fontWeight: '800',
              borderRadius: '50%',
              width: '15px',
              height: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}
          >
            3
          </span>
        </div>
      </div>

    </div>
  );
}
