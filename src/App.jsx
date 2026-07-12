import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';

// List of tabs and their titles for dynamic header updates
const TAB_LABELS = {
  'dashboard': 'Screen 2', // Default title as displayed in mockup
  'org-setup': 'Organization Setup',
  'assets': 'Assets List',
  'allocation': 'Allocation & Transfer',
  'booking': 'Resource Booking',
  'maintenance': 'Maintenance Logs',
  'audit': 'Audit Trials',
  'reports': 'System Reports',
  'notifications': 'All Notifications'
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const currentTitle = TAB_LABELS[activeTab] || 'AssetFlow';

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Right Scrollable Content Frame */}
      <main className="main-area">
        {/* Top Header */}
        <Header title={currentTitle} />

        {/* Dynamic Inner Page Component */}
        <div style={{ flexGrow: 1, marginTop: '8px' }}>
          {activeTab === 'dashboard' ? (
            <DashboardPage />
          ) : (
            <PlaceholderPage title={currentTitle} id={activeTab} />
          )}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <div>&copy; 2025 AssetFlow. All rights reserved.</div>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <span style={{ opacity: 0.5 }}>|</span>
            <a href="#terms">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
