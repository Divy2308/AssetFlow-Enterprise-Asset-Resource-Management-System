import React from 'react';
import {
  BoxIcon,
  OrgSetupIcon,
  AssetsIcon,
  TransferIcon,
  CalendarIcon,
  WrenchIcon,
  ShieldIcon,
  ReportsIcon,
  BellIcon
} from './Icons';
import promoImg from '../assets/sidebar_promo.jpg';
import { useUserRole } from '../context/RoleContext';
import { hasPermission } from '../utils/permissions';

// menuItems: each entry declares a `permission` key (from permissions.js)
// that must be true for the current role to see the item.
// Items without a `permission` key are visible to all authenticated users.
const menuItems = [
  { id: '/', label: 'Dashboard', Icon: BoxIcon },
  { id: '/org-setup', label: 'Organization setup', Icon: OrgSetupIcon }, // visible to all roles
  { id: '/asset', label: 'Assets', Icon: AssetsIcon, permission: 'nav_assets' },
  { id: '/allocation', label: 'Allocation & Transfer', Icon: TransferIcon, permission: 'nav_allocation' },
  { id: '/booking', label: 'Resource Booking', Icon: CalendarIcon, permission: 'nav_booking' },
  { id: '/maintenance', label: 'Maintenance', Icon: WrenchIcon, permission: 'nav_maintenance' },
  { id: '/audit', label: 'Audit', Icon: ShieldIcon, permission: 'nav_audit' },
  { id: '/reports', label: 'Reports', Icon: ReportsIcon, permission: 'nav_reports' },
  { id: '/notifications', label: 'Notifications', Icon: BellIcon, permission: 'nav_notifications' }
];

export default function Sidebar({ activeTab, onTabChange, unreadCount = 0 }) {
  // Role comes from context — no prop drilling needed
  const { role, loading } = useUserRole();

  // Filter menu items based on the current user's role.
  // While role is loading, show only items without a permission requirement
  // to avoid a flash of a full menu before filtering kicks in.
  const visibleItems = menuItems.filter((item) => {
    if (!item.permission) return true;                  // always visible
    if (loading) return false;                          // hide gated items while loading
    return hasPermission(role, item.permission);
  });

  return (
    <aside className="w-64 bg-white border-r border-border-color flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5 mb-8 select-none">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 animate-pulse-slow">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#FF5A1F" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M12 22V12" stroke="#FF5A1F" strokeWidth="2.5" />
            <path d="M12 12L3 7" stroke="#FF5A1F" strokeWidth="2.5" />
            <path d="M12 12l9-5" stroke="#FF5A1F" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="3" fill="#FF5A1F" />
          </svg>
          <span className="font-heading text-xl font-extrabold text-text-primary tracking-tight">
            Asset<span className="text-primary-orange">Flow</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav>
          <ul className="flex flex-col gap-1 p-0 m-0 list-none">
            {visibleItems.map((item) => {
              const isInterfaceActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left border ${isInterfaceActive
                        ? 'bg-primary-orange-light text-primary-orange border-primary-orange-border/30'
                        : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary border-transparent'
                      }`}
                  >
                    <span className="flex items-center justify-center shrink-0">
                      <item.Icon size={18} />
                    </span>
                    <span className="flex-grow text-left">
                      {item.label}
                    </span>
                    {item.id === '/notifications' && unreadCount > 0 && (
                      <span className="bg-primary-orange text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shrink-0 shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Sidebar Promo Call to Action */}
      <div className="bg-gradient-to-br from-primary-orange-light to-white border border-primary-orange-border/20 rounded-2xl p-5 text-center mt-6 flex flex-col items-center">
        <img
          src={promoImg}
          alt="Manage Assets illustration"
          className="w-[120px] h-auto mb-3 object-contain rounded-xl"
        />
        <h4 className="text-xs font-bold text-text-primary mb-3 leading-snug">
          Manage your assets smarter and faster
        </h4>
        <button
          onClick={() => onTabChange('/learn-more')}
          className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
        >
          Learn more
        </button>
      </div>
    </aside>
  );
}
