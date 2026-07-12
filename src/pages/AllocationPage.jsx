import React, { useState } from 'react';
import {
  UserIcon,
  SendIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  CalendarIcon,
  LaptopIcon,
  ProjectorIcon,
  ChairIcon,
  BoxIcon
} from '../components/Icons';

export default function AllocationPage({ assets, setAssets, employeesList }) {
  // 1. Selected Asset State - defaults to AF-0114 (id: 4) if present
  const [selectedAssetId, setSelectedAssetId] = useState(
    assets.some(a => a.id === 4) ? '4' : assets[0]?.id.toString() || ''
  );

  // 2. Transfer Form States
  const [targetEmployee, setTargetEmployee] = useState('');
  const [reason, setReason] = useState('');

  // 3. Allocation History State
  const [historyLogs, setHistoryLogs] = useState([
    { id: 1, date: 'Mar 12', details: 'Allocated to Priya Shah - Engineering' },
    { id: 2, date: 'Jan 04', details: 'Returned by Arjun Nair - condition: good' }
  ]);

  // Find the selected asset object
  const selectedAsset = assets.find((a) => a.id.toString() === selectedAssetId);
  const isAllocated = selectedAsset && selectedAsset.status === 'Allocated';
  const currentOwner = selectedAsset ? (selectedAsset.owner || '—') : '—';

  // Helper to find the asset type icon
  const getAssetIcon = (type) => {
    switch (type) {
      case 'laptop':
        return LaptopIcon;
      case 'projector':
        return ProjectorIcon;
      case 'chair':
        return ChairIcon;
      default:
        return BoxIcon;
    }
  };

  const SelectedIcon = selectedAsset ? getAssetIcon(selectedAsset.type) : BoxIcon;

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsset) return alert('No asset selected.');
    if (!targetEmployee) return alert('Please select a recipient employee.');
    if (!reason.trim()) return alert('Please enter a transfer reason.');

    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[today.getMonth()]} ${String(today.getDate()).padStart(2, '0')}`;

    // Update the state of assets in global state
    setAssets(
      assets.map((a) => {
        if (a.id.toString() === selectedAssetId) {
          return {
            ...a,
            status: 'Allocated',
            owner: targetEmployee,
            location: employeesList.find(e => e.name === targetEmployee)?.dept === 'Engineering' ? 'Bengaluru' : 'HQ Floor 2'
          };
        }
        return a;
      })
    );

    // Prepend to history logs state
    const actionText = isAllocated 
      ? `Transferred from ${currentOwner} to ${targetEmployee}`
      : `Allocated to ${targetEmployee}`;

    const newLog = {
      id: Date.now(),
      date: formattedDate,
      details: `${actionText} - reason: ${reason}`
    };

    setHistoryLogs([newLog, ...historyLogs]);
    alert(`Success! Asset ${selectedAsset.tag} has been updated in the directory.`);
    
    // Clear form inputs
    setReason('');
    setTargetEmployee('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Asset Selection Card */}
      <div className="allocation-form-card">
        
        {/* A. Asset Selector Input Group */}
        <div className="form-group">
          <label className="form-label">Asset</label>
          <div className="icon-select-input">
            <span className="select-icon-left">
              <SelectedIcon size={20} />
            </span>
            <select
              value={selectedAssetId}
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                setTargetEmployee('');
                setReason('');
              }}
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.tag} - {asset.name} ({asset.status})
                </option>
              ))}
            </select>
            <span className="select-chevron-right">
              <ChevronDownIcon size={16} />
            </span>
          </div>
        </div>

        {/* B. Dynamic Warning/Allocation Status Banner */}
        {isAllocated ? (
          <div 
            className="alert-banner" 
            style={{ 
              marginBottom: 0, 
              backgroundColor: 'var(--alert-red-bg)', 
              borderColor: 'var(--alert-red-border)',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              padding: '16px 20px'
            }}
          >
            <div className="alert-message-wrap" style={{ alignItems: 'flex-start' }}>
              <div className="alert-icon-box" style={{ color: 'var(--alert-red-text)', marginTop: '2px' }}>
                <AlertTriangleIcon size={20} />
              </div>
              <div>
                <span className="alert-text" style={{ color: 'var(--alert-red-text)', display: 'block', fontWeight: '700' }}>
                  Already Allocated to {currentOwner} ({employeesList.find(e => e.name === currentOwner)?.dept || 'Engineering'})
                </span>
                <span style={{ fontSize: '13px', color: '#D54040', fontWeight: '500' }}>
                  Direct re-allocation is blocked – submit a transfer request below.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="alert-banner" 
            style={{ 
              marginBottom: 0, 
              backgroundColor: '#E6F9F0', 
              borderColor: '#A7F3D0',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              padding: '16px 20px'
            }}
          >
            <div className="alert-message-wrap" style={{ alignItems: 'center' }}>
              <div className="alert-icon-box" style={{ color: '#10B981' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <span className="alert-text" style={{ color: '#10B981', display: 'block', fontWeight: '700' }}>
                  Available for allocation
                </span>
                <span style={{ fontSize: '13px', color: '#059669', fontWeight: '500' }}>
                  This asset is not currently assigned. You can allocate it directly.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* C. Transfer Request Form Panel */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="section-title" style={{ fontSize: '16px', margin: '4px 0 0 0' }}>
            {isAllocated ? 'Transfer Request' : 'Direct Allocation'}
          </h3>
          
          <div className="form-row">
            {/* From Selector */}
            <div className="form-group">
              <label className="form-label">From</label>
              <div className="icon-select-input">
                <span className="select-icon-left">
                  <UserIcon size={18} />
                </span>
                <select disabled value="owner">
                  <option value="owner">
                    {isAllocated ? currentOwner : 'N/A - Direct Allocation'}
                  </option>
                </select>
                <span className="select-chevron-right">
                  <ChevronDownIcon size={16} />
                </span>
              </div>
            </div>

            {/* To Selector */}
            <div className="form-group">
              <label className="form-label">To</label>
              <div className="icon-select-input">
                <span className="select-icon-left">
                  <UserIcon size={18} />
                </span>
                <select
                  required
                  value={targetEmployee}
                  onChange={(e) => setTargetEmployee(e.target.value)}
                >
                  <option value="">Select Employee...</option>
                  {employeesList
                    .filter((e) => e.name !== currentOwner)
                    .map((emp, idx) => (
                      <option key={idx} value={emp.name}>
                        {emp.name} ({emp.dept})
                      </option>
                    ))}
                </select>
                <span className="select-chevron-right">
                  <ChevronDownIcon size={16} />
                </span>
              </div>
            </div>
          </div>

          {/* Reason Field */}
          <div className="form-group">
            <label className="form-label">Reason</label>
            <div className="form-textarea-container">
              <textarea
                className="form-textarea"
                required
                maxLength={300}
                placeholder="Enter reason for transfer..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <span className="textarea-counter">
                {reason.length} / 300
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div>
            <button type="submit" className="btn-primary-orange">
              <SendIcon size={16} />
              Submit Request
            </button>
          </div>
        </form>
      </div>

      {/* D. Allocation History Log Feed */}
      <div className="history-section">
        <h3 className="section-title">Allocation history</h3>
        <div className="history-card">
          <ul className="history-list">
            {historyLogs.map((log) => (
              <li key={log.id} className="history-item">
                {/* Visual indicator icon */}
                <div className="history-icon-box">
                  <CalendarIcon size={16} />
                </div>
                
                {/* Timeline date */}
                <div className="history-date">
                  {log.date}
                </div>
                
                {/* Details snippet */}
                <div className="history-details-text">
                  {log.details}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
