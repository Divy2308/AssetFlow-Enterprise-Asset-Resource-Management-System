import React, { useState, useEffect } from 'react';
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
import LoginPage from './pages/LoginPage';
import { supabase } from './config/supabaseClient';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [notifications, setNotifications] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // 1. Fetch Employees list
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase.from('employees').select('*');
        if (!error && data) {
          setEmployeesList(data.map(e => ({ id: e.id, name: e.name, dept: e.department })));
        }
      } catch (err) {
        console.error('Error loading employees:', err);
      }
    };

    // 2. Fetch Assets directory
    const fetchAssets = async () => {
      try {
        const { data, error } = await supabase.from('assets').select('*, employees(name)');
        if (!error && data) {
          setAssets(data.map(a => ({
            id: a.id,
            tag: a.tag,
            name: a.name,
            category: a.category_name,
            status: a.status === 'AVAILABLE' ? 'Available' : a.status === 'ALLOCATED' ? 'Allocated' : 'Maintenance',
            location: a.location,
            type: a.type || 'other',
            owner: a.employees?.name || '—'
          })));
        }
      } catch (err) {
        console.error('Error loading assets:', err);
      }
    };

    // 3. Fetch Activity Notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase.from('notifications').select('*').order('id', { ascending: false });
        if (!error && data) {
          setNotifications(data.map(n => ({
            id: n.id,
            tag: n.tag,
            category: n.category,
            text: n.text,
            time: n.time_label,
            isUnread: n.is_unread,
            type: n.type,
            dotColor: n.dot_color,
            bgColor: n.bg_color
          })));
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    fetchEmployees();
    fetchAssets();
    fetchNotifications();
  }, [isLoggedIn]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const currentTitle = TAB_LABELS[activeTab] || 'AssetFlow';

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex bg-bg-gray min-h-screen">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />

      {/* Right Scrollable Content Frame */}
      <main className="flex-grow overflow-y-auto p-8 flex flex-col justify-between">
        {/* Top Header */}
        <Header 
          title={currentTitle} 
          unreadCount={unreadCount} 
          onNotificationClick={() => setActiveTab('notifications')} 
          onLogout={() => setIsLoggedIn(false)}
        />

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
