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

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div>
        {/* Brand Logo */}
        <div className="logo-container">
          <BoxIcon size={28} className="logo-orange" />
          <span className="logo-text">
            Asset<span className="logo-orange">Flow</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav>
          <ul className="nav-list">
            {menuItems.map((item) => {
              const isInterfaceActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`nav-item-btn ${isInterfaceActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">
                      <item.Icon size={18} />
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Sidebar Promo Call to Action */}
      <div className="promo-card">
        <img
          src={heroImg}
          alt="Manage Assets illustration"
          className="promo-image"
          style={{ width: '130px', height: 'auto', marginBottom: '8px' }}
        />
        <h4 className="promo-title">Manage your assets smarter and faster</h4>
        <button className="promo-btn">Learn more</button>
      </div>
    </aside>
  );
}
