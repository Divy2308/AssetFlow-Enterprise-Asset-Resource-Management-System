import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import OrgSetupPage from './pages/OrgSetupPage';
import AssetsPage from './pages/AssetsPage';
import AllocationPage from './pages/AllocationPage';
import BookingPage from './pages/BookingPage';
import MaintenancePage from './pages/MaintenancePage';
import AuditPage from './pages/AuditPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';

// List of tabs and their titles for dynamic header updates
const TAB_LABELS = {
  'dashboard': 'Screen 2', // Default title as displayed in mockup
  'org-setup': 'Screen 3  Organization setup (Admin only)',
  'assets': 'Screen 4  Asset registrations and directory',
  'allocation': 'Screen 5  Asset allocation & Transfer (the double-allocation block in action)',
  'booking': 'Screen 6  Resource booking',
  'maintenance': 'Screen 7  Maintenance Management',
  'audit': 'Screen 8  Asset Audit',
  'reports': 'Screen 9  Reports & Analytics',
  'notifications': 'Screen 10  Activity Logs & Notifications'
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [notifications, setNotifications] = useState([
    { id: 1, tag: 'AF-0014', category: 'approvals', text: 'Laptop AF-0014 assigned to Priya Shah', time: '2m ago', isUnread: true, type: 'laptop', dotColor: 'orange', bgColor: 'orange' },
    { id: 2, tag: 'AF-0055', category: 'approvals', text: 'Maintenance request AF-0055 approved', time: '18m ago', isUnread: true, type: 'wrench', dotColor: 'green', bgColor: 'green' },
    { id: 3, tag: 'Room B2', category: 'bookings', text: 'Booking confirmed : Room B2 : 2:00 to 3:00 PM', subtext: 'Room B2 • 2:00 PM – 3:00 PM', time: '1h ago', isUnread: true, type: 'calendar', dotColor: 'blue', bgColor: 'blue' },
    { id: 4, tag: 'AF-0033', category: 'transfers', text: 'Transfer approved : AF-0033 to facilities dept', time: '3h ago', isUnread: false, type: 'transfer', dotColor: 'purple', bgColor: 'purple' },
    { id: 5, tag: 'AF-0021', category: 'alerts', text: 'Overdue return : AF-0021 was due 3 days ago', time: '1d ago', isUnread: false, type: 'clock', dotColor: 'yellow', bgColor: 'yellow' },
    { id: 6, tag: 'AF-0088', category: 'alerts', text: 'Audit discrepancy flagged : AF-0088 damaged', time: '2d ago', isUnread: false, type: 'shield', dotColor: 'red', bgColor: 'red' }
  ]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const [assets, setAssets] = useState([
    { id: 1, tag: 'AF-0012', name: 'Dell Laptop', category: 'Electronics', status: 'Allocated', location: 'Bengaluru', type: 'laptop', owner: 'Priya' },
    { id: 2, tag: 'AF-0062', name: 'Projector', category: 'Electronics', status: 'Maintenance', location: 'HQ Floor 2', type: 'projector', owner: '—' },
    { id: 3, tag: 'AF-0201', name: 'Office Chair', category: 'Furniture', status: 'Available', location: 'Warehouse', type: 'chair', owner: '—' },
    { id: 4, tag: 'AF-0114', name: 'Dell laptop', category: 'Electronics', status: 'Allocated', location: 'Bengaluru', type: 'laptop', owner: 'Priya Shah' }
  ]);

  const employeesList = [
    { name: 'Priya Shah', dept: 'Engineering' },
    { name: 'aditi rao', dept: 'Engineering' },
    { name: 'rohan mehta', dept: 'Facilities' },
    { name: 'sana iqbal', dept: 'Human Resources (HR)' },
    { name: 'Manya Anand', dept: 'Facilities' },
    { name: 'Elroy M', dept: 'Engineering' },
    { name: 'Chintan Varma', dept: 'Human Resources (HR)' },
    { name: 'Minty Fish', dept: 'Human Resources (HR)' },
    { name: 'Cool Emu', dept: 'Facilities' }
  ];

  const currentTitle = TAB_LABELS[activeTab] || 'AssetFlow';

  return (
    <div className="flex bg-bg-gray min-h-screen">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />

      {/* Right Scrollable Content Frame */}
      <main className="flex-grow overflow-y-auto p-8 flex flex-col justify-between">
        {/* Top Header */}
        <Header title={currentTitle} unreadCount={unreadCount} onNotificationClick={() => setActiveTab('notifications')} />

        {/* Dynamic Inner Page Component */}
        <div className="flex-grow mt-2">
          {activeTab === 'dashboard' ? (
            <DashboardPage />
          ) : activeTab === 'org-setup' ? (
            <OrgSetupPage />
          ) : activeTab === 'assets' ? (
            <AssetsPage assets={assets} setAssets={setAssets} />
          ) : activeTab === 'allocation' ? (
            <AllocationPage assets={assets} setAssets={setAssets} employeesList={employeesList} />
          ) : activeTab === 'booking' ? (
            <BookingPage />
          ) : activeTab === 'maintenance' ? (
            <MaintenancePage assets={assets} setAssets={setAssets} />
          ) : activeTab === 'audit' ? (
            <AuditPage assets={assets} setAssets={setAssets} />
          ) : activeTab === 'reports' ? (
            <ReportsPage />
          ) : activeTab === 'notifications' ? (
            <NotificationsPage notifications={notifications} setNotifications={setNotifications} />
          ) : (
            <PlaceholderPage title={currentTitle} id={activeTab} />
          )}
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center text-xs font-semibold text-text-muted mt-12 pt-6 border-t border-border-color">
          <div>&copy; 2025 AssetFlow. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-text-secondary transition-all">Privacy Policy</a>
            <span className="opacity-30">|</span>
            <a href="#terms" className="hover:text-text-secondary transition-all">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
