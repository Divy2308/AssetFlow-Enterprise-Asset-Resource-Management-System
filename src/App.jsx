import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import LearnMorePage from './pages/LearnMorePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import { supabase } from './config/supabaseClient';

// List of tabs and their titles for dynamic header updates
const TAB_LABELS = {
  '/': 'Dashboard Overview',
  '/org-setup': 'Organization Setup',
  '/asset': 'Asset Registry & Directory',
  '/allocation': 'Asset Allocation & Transfers',
  '/booking': 'Resource Schedule & Bookings',
  '/maintenance': 'Maintenance Ticket Management',
  '/audit': 'Asset Verification Audits',
  '/reports': 'Reports & Analytics',
  '/notifications': 'Activity Logs & Alerts',
  '/learn-more': 'User Guide & Modules',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service'
};

function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeTab = location.pathname;

  const [notifications, setNotifications] = useState([]);
  const [assets, setAssets] = useState([]);

  // 1. Listen for Supabase Auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch logged-in user profile from employees table
  useEffect(() => {
    if (!session) {
      setCurrentUser(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*, departments(name)')
          .eq('email', session.user.email)
          .single();

        if (!error && data) {
          setCurrentUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.departments?.name || '—'
          });
        } else {
          // Fallback profile if user profile is missing in the database table
          setCurrentUser({
            id: 999,
            name: session.user.email.split('@')[0],
            email: session.user.email,
            role: 'EMPLOYEE',
            department: '—'
          });
        }
      } catch (err) {
        console.error('Error fetching employee profile:', err);
      }
    };
    fetchProfile();
  }, [session]);

  // 3. Load global data on mounting/active session
  useEffect(() => {
    if (!session) return;

    // Load assets
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

    // Load notifications
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

    fetchAssets();
    fetchNotifications();
  }, [session]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const currentTitle = TAB_LABELS[activeTab] || 'AssetFlow';

  if (!session) {
    return <LoginPage onLogin={() => {}} />;
  }

  return (
    <div className="flex bg-bg-gray min-h-screen">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(path) => navigate(path)} 
        unreadCount={unreadCount} 
        userRole={currentUser ? currentUser.role : 'EMPLOYEE'}
      />

      {/* Right Scrollable Content Frame */}
      <main className="flex-grow overflow-y-auto p-8 flex flex-col justify-between">
        {/* Top Header */}
        <Header 
          title={currentTitle} 
          unreadCount={unreadCount} 
          onNotificationClick={() => navigate('/notifications')} 
          onLogout={async () => {
            await supabase.auth.signOut();
          }}
          userName={currentUser ? currentUser.name : 'User'}
        />

        {/* Dynamic Inner Page Component via React Router Routes */}
        <div className="flex-grow mt-2">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            
            <Route path="/org-setup" element={<OrgSetupPage />} />

            <Route path="/asset" element={<AssetsPage assets={assets} setAssets={setAssets} />} />
            <Route path="/allocation" element={<AllocationPage assets={assets} setAssets={setAssets} />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/maintenance" element={<MaintenancePage assets={assets} setAssets={setAssets} />} />
            <Route path="/audit" element={<AuditPage assets={assets} setAssets={setAssets} />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage notifications={notifications} setNotifications={setNotifications} />} />
            <Route path="/learn-more" element={<LearnMorePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Fallback 404 Route redirecting to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center text-xs font-semibold text-text-muted mt-12 pt-6 border-t border-border-color">
          <div>&copy; 2025 AssetFlow. All rights reserved.</div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/privacy')} className="hover:text-text-secondary transition-all cursor-pointer">Privacy Policy</button>
            <span className="opacity-30">|</span>
            <button onClick={() => navigate('/terms')} className="hover:text-text-secondary transition-all cursor-pointer">Terms of Service</button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
