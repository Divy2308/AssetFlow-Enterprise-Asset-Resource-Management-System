import React, { useState } from 'react';
import {
  CalendarIcon,
  InfoIcon,
  EyeIcon,
  FileTextIcon,
  LaptopIcon,
  ChairIcon,
  MonitorIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '../components/Icons';

export default function AuditPage({ assets = [], setAssets }) {
  // 1. Audit Items List State (pre-populated with mock data matching Screen 8)
  const [auditItems, setAuditItems] = useState([
    { id: '1', tag: 'AF-003', name: 'Dell Laptop', expected: 'Desk E12', actual: 'Desk E12', status: 'Verified', remarks: 'All good', type: 'laptop' },
    { id: '2', tag: 'AF-9921', name: 'Office Chair', expected: 'Desk E14', actual: 'Not Found', status: 'Missing', remarks: 'Not available at expected location', type: 'chair' },
    { id: '3', tag: 'AF-9838', name: 'Monitor', expected: 'Desk E15', actual: 'Desk E17', status: 'Damaged', remarks: 'Screen flickering', type: 'monitor' }
  ]);

  // Extended mock items revealed on clicking "View all assets"
  const [showAllAssets, setShowAllAssets] = useState(false);
  const extraMockItems = [
    { id: '4', tag: 'AF-0012', name: 'Dell Laptop', expected: 'Desk E20', actual: 'Desk E20', status: 'Verified', remarks: 'Verified by Priya', type: 'laptop' },
    { id: '5', tag: 'AF-0201', name: 'Office Chair', expected: 'Warehouse', actual: 'Warehouse', status: 'Verified', remarks: 'In stock', type: 'chair' }
  ];

  // 2. Audit Workflow Controls
  const [cycleClosed, setCycleClosed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState(null);
  
  // Edit Form Fields
  const [editForm, setEditForm] = useState({
    actual: '',
    status: 'Verified',
    remarks: ''
  });

  // 3. Discrepancy Report Modal Toggle
  const [showReportModal, setShowReportModal] = useState(false);

  // Compute stats
  const visibleItems = showAllAssets ? [...auditItems, ...extraMockItems] : auditItems;
  const flaggedCount = auditItems.filter(item => ['Missing', 'Damaged'].includes(item.status)).length;

  // Asset type icon selector
  const getAssetIcon = (type) => {
    switch (type) {
      case 'laptop': return LaptopIcon;
      case 'chair': return ChairIcon;
      case 'monitor': return MonitorIcon;
      default: return LaptopIcon;
    }
  };

  // Sync back to core database assets
  const syncToAssets = (tag, status, actualLocation) => {
    if (!setAssets || !assets.length) return;

    let targetStatus = 'Available';
    if (status === 'Verified') {
      targetStatus = 'Allocated';
    } else if (status === 'Missing') {
      targetStatus = 'Maintenance'; // Set to Maintenance/Unavailable
    } else if (status === 'Damaged') {
      targetStatus = 'Maintenance';
    }

    setAssets(
      assets.map((a) => {
        if (a.tag.toUpperCase() === tag.toUpperCase()) {
          return {
            ...a,
            status: targetStatus,
            location: actualLocation
          };
        }
        return a;
      })
    );
  };

  // Trigger edit modal opening
  const handleOpenEdit = (item) => {
    if (cycleClosed) return;
    setSelectedAuditItem(item);
    setEditForm({
      actual: item.actual,
      status: item.status,
      remarks: item.remarks
    });
    setShowEditModal(true);
  };

  // Save audit update
  const handleSaveAudit = (e) => {
    e.preventDefault();
    if (!selectedAuditItem) return;

    setAuditItems(
      auditItems.map((item) => {
        if (item.id === selectedAuditItem.id) {
          return {
            ...item,
            actual: editForm.actual,
            status: editForm.status,
            remarks: editForm.remarks
          };
        }
        return item;
      })
    );

    // Synchronize to the global asset listings
    syncToAssets(selectedAuditItem.tag, editForm.status, editForm.actual);

    setShowEditModal(false);
    setSelectedAuditItem(null);
    alert(`Success! Audit record for ${selectedAuditItem.tag} has been updated.`);
  };

  // Handle closing audit cycle
  const handleCloseCycle = () => {
    if (window.confirm('Are you sure you want to close the current Q3 Audit Cycle? This action freezes all checklist entries.')) {
      setCycleClosed(true);
      alert('Q3 Audit Cycle closed. A discrepancies report has been generated.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dynamic Sub-header Info */}
      <div style={{ marginTop: '-8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Audit cycle, checklist, and discrepancy report
        </span>
      </div>

      {/* 1. Top Q3 Audit Parameters Box */}
      <div className="audit-header-card">
        
        {/* Cell 1: Cycle details */}
        <div className="audit-header-section divider">
          <div className="param-icon-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
          <div className="param-content">
            <span className="param-title">Q3 Audit: Engineering dept - 1-15 Jul</span>
            <span className="param-sub">Auditors: A. Rao, S. Iqbal</span>
          </div>
        </div>

        {/* Cell 2: Period range */}
        <div className="audit-header-section divider">
          <div className="param-icon-box">
            <CalendarIcon size={20} />
          </div>
          <div className="param-content">
            <span className="param-sub" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cycle Period</span>
            <span className="param-title" style={{ fontSize: '13px', marginTop: '2px' }}>1 - 15 Jul 2026</span>
          </div>
        </div>

        {/* Cell 3: Metrics count */}
        <div className="audit-header-section">
          <div className="param-icon-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="param-content">
            <span className="param-sub" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Assets</span>
            <span className="param-title" style={{ fontSize: '18px', marginTop: '2px', fontWeight: '800' }}>123</span>
          </div>
        </div>

      </div>

      {/* 2. Audit Table Grid */}
      <div className="table-card">
        <h3 className="section-title" style={{ padding: '24px 24px 8px 24px', margin: 0, fontSize: '16px' }}>
          Audit Summary
        </h3>
        
        <table className="org-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Expected Location</th>
              <th>Actual Location</th>
              <th>Status</th>
              <th>Remarks</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const AssetIcon = getAssetIcon(item.type);
              return (
                <tr key={item.id}>
                  {/* Asset Tag & Name */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          backgroundColor: '#FFF4EF', 
                          color: '#FF5A1F',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}
                      >
                        <AssetIcon size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>{item.tag}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>{item.name}</span>
                      </div>
                    </div>
                  </td>

                  {/* Expected Location */}
                  <td>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                      {item.expected}
                    </span>
                  </td>

                  {/* Actual Location */}
                  <td>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                      {item.actual}
                    </span>
                  </td>

                  {/* Status Badges */}
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {item.status}
                    </span>
                  </td>

                  {/* Remarks text */}
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      {item.remarks || '—'}
                    </span>
                  </td>

                  {/* Action Preview eye button */}
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        className="btn-eye"
                        disabled={cycleClosed}
                        style={{ opacity: cycleClosed ? 0.5 : 1 }}
                        onClick={() => handleOpenEdit(item)}
                        aria-label="View asset details"
                      >
                        <EyeIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* View All Assets toggle block */}
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn-outline-orange"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
            onClick={() => setShowAllAssets(!showAllAssets)}
          >
            {showAllAssets ? 'Show Less' : 'View all assets'}
            {showAllAssets ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          </button>
        </div>
      </div>

      {/* 3. Discrepancy Report warning Banner */}
      {flaggedCount > 0 ? (
        <div 
          className="alert-banner" 
          style={{ 
            marginBottom: 0, 
            backgroundColor: 'var(--alert-orange-bg)', 
            borderColor: 'var(--alert-orange-border)',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px'
          }}
        >
          <div className="alert-message-wrap" style={{ alignItems: 'center' }}>
            <div className="alert-icon-box" style={{ color: 'var(--primary-orange)' }}>
              <FileTextIcon size={22} strokeWidth={2.2} />
            </div>
            <div>
              <span className="alert-text" style={{ color: 'var(--primary-orange)', display: 'block', fontWeight: '700' }}>
                {flaggedCount} assets flagged – discrepancy report generated automatically
              </span>
              <span style={{ fontSize: '13px', color: '#D05A20', fontWeight: '500' }}>
                Review the discrepancies and take necessary actions.
              </span>
            </div>
          </div>

          <button 
            className="btn-outline-orange"
            onClick={() => setShowReportModal(true)}
          >
            <FileTextIcon size={14} />
            View Discrepancy Report
          </button>
        </div>
      ) : (
        <div 
          className="alert-banner" 
          style={{ 
            marginBottom: 0, 
            backgroundColor: '#E6F9F0', 
            borderColor: '#A7F3D0',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px'
          }}
        >
          <div className="alert-message-wrap" style={{ alignItems: 'center' }}>
            <div className="alert-icon-box" style={{ color: '#10B981' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <span className="alert-text" style={{ color: '#10B981', display: 'block', fontWeight: '700' }}>
                All clear! No discrepancies flagged in the current cycle
              </span>
              <span style={{ fontSize: '13px', color: '#059669', fontWeight: '500' }}>
                All checked assets are verified and correct in location.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Slate Close Audit Cycle Trigger Button */}
      <div>
        <button
          className="btn-close-cycle"
          disabled={cycleClosed}
          onClick={handleCloseCycle}
          style={{ opacity: cycleClosed ? 0.6 : 1 }}
        >
          <FileTextIcon size={16} />
          {cycleClosed ? 'Audit Cycle Closed' : 'Close Audit Cycle'}
        </button>
      </div>

      {/* 5. Disclaimer about Audit Cycle details banner */}
      <div className="banner-green-info">
        <div className="banner-green-text-wrap">
          <div className="banner-green-icon">
            <InfoIcon size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h4 className="banner-green-title">About Audit Cycle</h4>
            <p className="banner-green-desc">
              The audit cycle helps verify the physical presence, condition, and location of assets. Once closed, a discrepancy report is auto-generated for review and action.
            </p>
          </div>
        </div>

        {/* Dynamic clipboard shield drawing */}
        <div style={{ display: 'flex', alignItems: 'center', opacity: 0.85, marginRight: '10px' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="m9 11 3 3L22 4" strokeWidth="2.4" />
          </svg>
        </div>
      </div>

      {/* 6. Edit Audit Item modal overlay */}
      {showEditModal && selectedAuditItem && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleSaveAudit}>
            <div className="modal-header">
              <h3 className="modal-title">Verify Asset: {selectedAuditItem.tag}</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAuditItem(null);
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '600' }}>Asset Name</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedAuditItem.name}</span>
              </div>
              
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: '600' }}>Expected Location</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedAuditItem.expected}</span>
              </div>
            </div>

            {/* Actual Location Input */}
            <div className="form-group">
              <label className="form-label">Actual Location</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.actual}
                onChange={(e) => setEditForm({ ...editForm, actual: e.target.value })}
              />
            </div>

            {/* Select Status */}
            <div className="form-group">
              <label className="form-label">Verification Status</label>
              <select
                className="form-select"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Verified">Verified</option>
                <option value="Missing">Missing</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            {/* Remarks Input */}
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. All good, screen replacement required"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAuditItem(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Save Verification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Discrepancy Report Modal Overlay */}
      {showReportModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Discrepancy Report - Q3 Cycle</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowReportModal(false)}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                The following discrepancy rows require direct facility or management action. Missing items trigger security audits, and damaged items require maintenance tickets.
              </p>

              <table className="org-table" style={{ marginTop: '8px' }}>
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Name</th>
                    <th>Expected</th>
                    <th>Actual</th>
                    <th>Discrepancy</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {auditItems
                    .filter((item) => ['Missing', 'Damaged'].includes(item.status))
                    .map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '700', fontSize: '13px' }}>{item.tag}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name}</td>
                        <td style={{ fontSize: '12px' }}>{item.expected}</td>
                        <td style={{ fontSize: '12px', color: item.actual === 'Not Found' ? 'var(--alert-red-text)' : 'inherit' }}>
                          {item.actual}
                        </td>
                        <td>
                          <span className={`status-badge ${item.status.toLowerCase()}`} style={{ padding: '4px 8px', fontSize: '10px' }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.remarks}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-submit"
                onClick={() => {
                  window.print();
                }}
              >
                Print Report
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowReportModal(false)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
