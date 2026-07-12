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
import RequireRole from '../components/RequireRole';
import { ROLES } from '../utils/permissions';

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
    <div className="flex flex-col gap-6">
      
      {/* Subheader text */}
      <div className="mt-[-16px]">
        <span className="text-xs font-semibold text-text-secondary select-none">
          Audit cycle, checklist, and discrepancy report
        </span>
      </div>

      {/* 1. Top Q3 Audit Parameters Box */}
      <div className="bg-white border border-border-color rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-color overflow-hidden">
        
        {/* Cell 1: Cycle details */}
        <div className="flex items-center gap-4 p-5 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary-orange-light text-primary-orange flex items-center justify-center shrink-0">
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
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-extrabold text-text-primary">Q3 Audit: Engineering dept</span>
            <span className="text-[11px] font-bold text-text-secondary">Auditors: A. Rao, S. Iqbal</span>
          </div>
        </div>

        {/* Cell 2: Period range */}
        <div className="flex items-center gap-4 p-5 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Cycle Period</span>
            <span className="text-sm font-extrabold text-text-primary">1 - 15 Jul 2026</span>
          </div>
        </div>

        {/* Cell 3: Metrics count */}
        <div className="flex items-center gap-4 p-5 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-success-green-text flex items-center justify-center shrink-0">
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
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Total Assets</span>
            <span className="text-lg font-black text-text-primary leading-none">123</span>
          </div>
        </div>

      </div>

      {/* 2. Audit Table Grid */}
      <div className="bg-white border border-border-color rounded-2xl shadow-sm overflow-hidden">
        <h3 className="font-heading text-sm font-extrabold text-text-primary border-b border-border-color p-4 pb-3">
          Audit Summary
        </h3>
        
        <table className="w-full border-collapse text-left">
          <thead className="bg-bg-gray border-b border-border-color">
            <tr>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Asset</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Expected Location</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Actual Location</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Remarks</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider w-[5%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const AssetIcon = getAssetIcon(item.type);
              return (
                <tr key={item.id} className="border-b border-border-color last:border-b-0 hover:bg-bg-gray/30 transition-all">
                  {/* Asset Tag & Name */}
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary-orange-light text-primary-orange">
                        <AssetIcon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-text-primary text-xs tracking-tight">{item.tag}</span>
                        <span className="text-[10px] text-text-secondary font-semibold mt-0.5">{item.name}</span>
                      </div>
                    </div>
                  </td>

                  {/* Expected Location */}
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <span className="font-bold text-text-primary text-xs">
                      {item.expected}
                    </span>
                  </td>

                  {/* Actual Location */}
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <span className="font-bold text-text-primary text-xs">
                      {item.actual}
                    </span>
                  </td>

                  {/* Status Badges */}
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      item.status === 'Verified'
                        ? 'bg-success-green-bg text-success-green-text border-success-green-border/30'
                        : item.status === 'Missing'
                        ? 'bg-red-50 text-alert-red-text border-alert-red-border/20'
                        : 'bg-orange-50 text-primary-orange border-primary-orange-border/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Verified'
                          ? 'bg-success-green-text'
                          : item.status === 'Missing'
                          ? 'bg-alert-red-text'
                          : 'bg-primary-orange'
                      }`} />
                      {item.status}
                    </span>
                  </td>

                  {/* Remarks text */}
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <span className="text-xs text-text-secondary font-semibold">
                      {item.remarks || '—'}
                    </span>
                  </td>

                  {/* Action Preview eye button */}
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="flex justify-center">
                      <button
                        className="w-8 h-8 rounded-lg text-text-secondary hover:bg-bg-gray hover:text-text-primary flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={cycleClosed}
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
        <div className="p-4 flex justify-center border-t border-border-color bg-white">
          <button
            className="border border-primary-orange text-primary-orange hover:bg-primary-orange-light text-xs font-extrabold py-2 px-5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            onClick={() => setShowAllAssets(!showAllAssets)}
          >
            {showAllAssets ? 'Show Less' : 'View all assets'}
            {showAllAssets ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          </button>
        </div>
      </div>

      {/* 3. Discrepancy Report warning Banner */}
      {flaggedCount > 0 ? (
        <div className="bg-orange-50 border border-primary-orange-border/30 rounded-2xl p-4 flex justify-between items-center gap-4 flex-wrap text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary-orange flex items-center justify-center shrink-0">
              <FileTextIcon size={20} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-extrabold text-primary-orange">
                {flaggedCount} assets flagged – discrepancy report generated automatically
              </span>
              <span className="text-xs font-semibold text-orange-700/80">
                Review the discrepancies and take necessary actions.
              </span>
            </div>
          </div>

          <button 
            className="border border-primary-orange text-primary-orange hover:bg-primary-orange-light text-xs font-extrabold py-2.5 px-5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs bg-white"
            onClick={() => setShowReportModal(true)}
          >
            <FileTextIcon size={14} />
            View Discrepancy Report
          </button>
        </div>
      ) : (
        <div className="bg-success-green-bg border border-success-green-border/30 rounded-2xl p-4 flex justify-between items-center gap-4 flex-wrap text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-success-green-text flex items-center justify-center shrink-0">
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-extrabold text-success-green-text">
                All clear! No discrepancies flagged in the current cycle
              </span>
              <span className="text-xs font-semibold text-success-green-text/80">
                All checked assets are verified and correct in location.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Slate Close Audit Cycle Trigger Button — admin only */}
      <div className="pt-1">
        <RequireRole
          allow={[ROLES.ADMIN]}
          fallback={
            <div className="flex items-center gap-2 bg-bg-gray border border-border-color rounded-xl px-5 py-3 text-xs font-semibold text-text-secondary w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Close Audit Cycle — Admin only
            </div>
          }
        >
          <button
            className="bg-primary-orange hover:bg-primary-orange-hover disabled:bg-primary-orange/60 text-white text-sm font-extrabold py-3 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed"
            disabled={cycleClosed}
            onClick={handleCloseCycle}
          >
            <FileTextIcon size={16} />
            {cycleClosed ? 'Audit Cycle Closed' : 'Close Audit Cycle'}
          </button>
        </RequireRole>
      </div>

      {/* 5. Disclaimer about Audit Cycle details banner */}
      <div className="bg-success-green-bg border border-success-green-border/30 rounded-2xl p-5 flex justify-between items-center gap-4 flex-wrap text-left">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-success-green-text flex items-center justify-center shrink-0 mt-0.5">
            <InfoIcon size={20} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-extrabold text-success-green-text">About Audit Cycle</h4>
            <p className="text-xs font-semibold text-success-green-text/80 leading-relaxed m-0">
              The audit cycle helps verify the physical presence, condition, and location of assets. Once closed, a discrepancy report is auto-generated for review and action.
            </p>
          </div>
        </div>

        {/* Dynamic clipboard shield drawing */}
        <div className="flex items-center opacity-80 mr-2 shrink-0">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form className="bg-white border border-border-color rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col gap-5 p-6" onSubmit={handleSaveAudit}>
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <h3 className="font-heading text-base font-extrabold text-text-primary">Verify Asset: {selectedAuditItem.tag}</h3>
              <button 
                type="button" 
                className="text-text-secondary hover:text-text-primary text-xl font-bold transition cursor-pointer"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAuditItem(null);
                }}
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border-color pb-3 mb-1">
              <div>
                <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Asset Name</span>
                <span className="text-sm font-extrabold text-text-primary mt-0.5 block">{selectedAuditItem.name}</span>
              </div>
              
              <div>
                <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Expected Location</span>
                <span className="text-sm font-extrabold text-text-primary mt-0.5 block">{selectedAuditItem.expected}</span>
              </div>
            </div>

            {/* Actual Location Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Actual Location</label>
              <input
                type="text"
                required
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={editForm.actual}
                onChange={(e) => setEditForm({ ...editForm, actual: e.target.value })}
              />
            </div>

            {/* Select Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Verification Status</label>
              <select
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium cursor-pointer"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Verified">Verified</option>
                <option value="Missing">Missing</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            {/* Remarks Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Remarks</label>
              <input
                type="text"
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                placeholder="e.g. All good, screen replacement required"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-color mt-2">
              <button 
                type="button" 
                className="border border-border-color bg-white hover:bg-bg-gray text-text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl transition cursor-pointer"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAuditItem(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer">
                Save Verification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Discrepancy Report Modal Overlay */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-border-color rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col gap-5 p-6">
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <h3 className="font-heading text-base font-extrabold text-text-primary">Discrepancy Report - Q3 Cycle</h3>
              <button 
                type="button" 
                className="text-text-secondary hover:text-text-primary text-xl font-bold transition cursor-pointer"
                onClick={() => setShowReportModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-text-secondary leading-relaxed m-0">
                The following discrepancy rows require direct facility or management action. Missing items trigger security audits, and damaged items require maintenance tickets.
              </p>

              <div className="border border-border-color rounded-xl overflow-hidden shadow-xs">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-bg-gray border-b border-border-color">
                    <tr>
                      <th className="p-3 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Asset Tag</th>
                      <th className="p-3 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Name</th>
                      <th className="p-3 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Expected</th>
                      <th className="p-3 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Actual</th>
                      <th className="p-3 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Discrepancy</th>
                      <th className="p-3 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditItems
                      .filter((item) => ['Missing', 'Damaged'].includes(item.status))
                      .map((item) => (
                        <tr key={item.id} className="border-b border-border-color last:border-b-0">
                          <td className="p-3 text-xs font-bold text-text-primary">{item.tag}</td>
                          <td className="p-3 text-[11px] font-semibold text-text-secondary">{item.name}</td>
                          <td className="p-3 text-[11px] font-semibold text-text-primary">{item.expected}</td>
                          <td className={`p-3 text-[11px] font-bold ${item.actual === 'Not Found' ? 'text-alert-red-text' : 'text-text-primary'}`}>
                            {item.actual}
                          </td>
                          <td className="p-3 text-[11px] font-medium text-text-primary">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              item.status === 'Missing'
                                ? 'bg-red-50 text-alert-red-text border-alert-red-border/20'
                                : 'bg-orange-50 text-primary-orange border-primary-orange-border/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] font-semibold text-text-secondary max-w-[120px] truncate">{item.remarks}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-color mt-2">
              <button 
                type="button" 
                className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-5 rounded-xl transition shadow-sm cursor-pointer"
                onClick={() => {
                  window.print();
                }}
              >
                Print Report
              </button>
              <button 
                type="button" 
                className="border border-border-color bg-white hover:bg-bg-gray text-text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl transition cursor-pointer"
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
