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
import heroImg from '../assets/hero.png';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', Icon: BoxIcon },
  { id: 'org-setup', label: 'Organization setup', Icon: OrgSetupIcon },
  { id: 'assets', label: 'Assets', Icon: AssetsIcon },
  { id: 'allocation', label: 'Allocation & Transfer', Icon: TransferIcon },
  { id: 'booking', label: 'Resource Booking', Icon: CalendarIcon },
  { id: 'maintenance', label: 'Maintenance', Icon: WrenchIcon },
  { id: 'audit', label: 'Audit', Icon: ShieldIcon },
  { id: 'reports', label: 'Reports', Icon: ReportsIcon },
  { id: 'notifications', label: 'Notifications', Icon: BellIcon }
];

export default function Sidebar({ activeTab, onTabChange, unreadCount = 0 }) {
  return (
    <aside className="w-64 bg-white border-r border-border-color flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-8">
          <BoxIcon size={28} className="text-primary-orange" />
          <span className="font-heading text-xl font-extrabold text-text-primary tracking-tight">
            Asset<span className="text-primary-orange">Flow</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav>
          <ul className="flex flex-col gap-1 p-0 m-0 list-none">
            {menuItems.map((item) => {
              const isInterfaceActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left border ${
                      isInterfaceActive
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
                    {item.id === 'notifications' && unreadCount > 0 && (
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
          src={heroImg}
          alt="Manage Assets illustration"
          className="w-[120px] h-auto mb-3"
        />
        <h4 className="text-xs font-bold text-text-primary mb-3 leading-snug">
          Manage your assets smarter and faster
        </h4>
        <button className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm cursor-pointer">
          Learn more
        </button>
      </div>
    </aside>
  );
}
