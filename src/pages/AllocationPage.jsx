import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
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
import RequireRole from '../components/RequireRole';
import { ROLES } from '../utils/permissions';

export default function AllocationPage({ assets, setAssets }) {
  // 1. Selected Asset State - defaults to AF-0114 (id: 4) if present
  const [selectedAssetId, setSelectedAssetId] = useState(
    assets.some(a => a.id === 4) ? '4' : assets[0]?.id.toString() || ''
  );

  // 2. Transfer Form States
  const [targetEmployee, setTargetEmployee] = useState('');
  const [reason, setReason] = useState('');

  // 3. Dynamic Employees List loaded from Supabase
  const [localEmployeesList, setLocalEmployeesList] = useState([]);

  // Fetch employees list live on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data: emps, error: empsError } = await supabase
          .from('employees')
          .select('*');
        
        const { data: depts, error: deptsError } = await supabase
          .from('departments')
          .select('*');

        if (emps && depts) {
          const deptIdToName = {};
          depts.forEach(d => {
            deptIdToName[d.id] = d.name;
          });

          setLocalEmployeesList(emps.map(e => ({
            id: e.id,
            name: e.name,
            dept: e.department_id ? (deptIdToName[e.department_id] || '—') : '—'
          })));
        }
      } catch (err) {
        console.error('Error fetching employees for allocations:', err);
      }
    };
    fetchEmployees();
  }, []);

  // 4. Allocation History State
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return alert('No asset selected.');
    if (!targetEmployee) return alert('Please select a recipient employee.');
    if (!reason.trim()) return alert('Please enter a transfer reason.');

    const emp = localEmployeesList.find((e) => e.name === targetEmployee);
    const targetOwnerId = emp ? emp.id : null;
    const targetLocation = emp?.dept === 'Engineering' ? 'Bengaluru' : 'HQ Floor 2';

    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[today.getMonth()]} ${String(today.getDate()).padStart(2, '0')}`;

    const actionText = isAllocated 
      ? `Transferred from ${currentOwner} to ${targetEmployee}`
      : `Allocated to ${targetEmployee}`;

    try {
      // 1. Update status and owner in Supabase
      const { error: assetError } = await supabase
        .from('assets')
        .update({
          status: 'ALLOCATED',
          owner_id: targetOwnerId,
          location: targetLocation
        })
        .eq('id', selectedAsset.id);

      if (assetError) {
        return alert('Failed to allocate asset in database: ' + assetError.message);
      }

      // 2. Insert into allocation history logs in Supabase
      await supabase
        .from('allocation_history')
        .insert([
          {
            asset_id: selectedAsset.id,
            details: `${actionText} - reason: ${reason}`
          }
        ]);

      // 3. Update local state
      setAssets(
        assets.map((a) => {
          if (a.id === selectedAsset.id) {
            return {
              ...a,
              status: 'Allocated',
              owner: targetEmployee,
              location: targetLocation
            };
          }
          return a;
        })
      );

      // Prepend to history logs state locally
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

    } catch (err) {
      console.error('Error during allocation transaction:', err);
      alert('An unexpected error occurred during database write.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Asset Selection Card */}
      <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        
        {/* A. Asset Selector Input Group */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Asset</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-text-secondary">
              <SelectedIcon size={20} />
            </span>
            <select
              value={selectedAssetId}
              className="w-full border border-border-color bg-white pl-11 pr-10 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-orange text-text-primary appearance-none cursor-pointer"
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
            <span className="absolute right-4 top-3.5 text-text-secondary pointer-events-none">
              <ChevronDownIcon size={16} />
            </span>
          </div>
        </div>

        {/* B. Dynamic Warning/Allocation Status Banner */}
        {isAllocated ? (
          <div className="bg-alert-red-bg border border-alert-red-border/60 rounded-2xl p-4 flex flex-col gap-1 text-left">
            <div className="flex items-start gap-3">
              <div className="text-alert-red-text shrink-0 mt-0.5">
                <AlertTriangleIcon size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-extrabold text-alert-red-text">
                  Already Allocated to {currentOwner} ({localEmployeesList.find(e => e.name === currentOwner)?.dept || 'Engineering'})
                </span>
                <span className="text-xs font-semibold text-red-700/80">
                  Direct re-allocation is blocked – submit a transfer request below.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-success-green-bg border border-success-green-border/30 rounded-2xl p-4 flex flex-col gap-1 text-left">
            <div className="flex items-center gap-3">
              <div className="text-success-green-text shrink-0">
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
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-extrabold text-success-green-text">
                  Available for allocation
                </span>
                <span className="text-xs font-semibold text-success-green-text/80">
                  This asset is not currently assigned. You can allocate it directly.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* C. Transfer Request Form Panel — admin/asset_manager only */}
        <RequireRole
          allow={[ROLES.ADMIN, ROLES.ASSET_MANAGER]}
          fallback={
            <div className="bg-bg-gray border border-border-color rounded-xl p-4 text-xs font-semibold text-text-secondary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Only Asset Managers and Admins can submit allocation or transfer requests.
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h3 className="font-heading text-sm font-extrabold text-text-primary border-b border-border-color pb-2">
              {isAllocated ? 'Transfer Request' : 'Direct Allocation'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">From</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-text-secondary">
                    <UserIcon size={18} />
                  </span>
                  <select 
                    disabled 
                    value="owner"
                    className="w-full border border-border-color bg-[#F8FAFC]/60 pl-11 pr-10 py-3 rounded-xl text-sm font-semibold focus:outline-none text-text-secondary appearance-none cursor-not-allowed"
                  >
                    <option value="owner">
                      {isAllocated ? currentOwner : 'N/A - Direct Allocation'}
                    </option>
                  </select>
                  <span className="absolute right-4 top-3.5 text-text-muted pointer-events-none">
                    <ChevronDownIcon size={16} />
                  </span>
                </div>
              </div>

              {/* To Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">To</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-text-secondary">
                    <UserIcon size={18} />
                  </span>
                  <select
                    required
                    value={targetEmployee}
                    className="w-full border border-border-color bg-white pl-11 pr-10 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-orange text-text-primary appearance-none cursor-pointer"
                    onChange={(e) => setTargetEmployee(e.target.value)}
                  >
                    <option value="">Select Employee...</option>
                    {localEmployeesList
                      .filter((e) => e.name !== currentOwner)
                      .map((emp, idx) => (
                        <option key={idx} value={emp.name}>
                          {emp.name} ({emp.dept})
                        </option>
                      ))}
                  </select>
                  <span className="absolute right-4 top-3.5 text-text-secondary pointer-events-none">
                    <ChevronDownIcon size={16} />
                  </span>
                </div>
              </div>
            </div>

            {/* Reason Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Reason</label>
              <div className="relative">
                <textarea
                  className="w-full border border-border-color bg-white px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-orange text-text-primary min-h-[100px] placeholder:text-text-muted resize-none"
                  required
                  maxLength={300}
                  placeholder="Enter reason for transfer..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="absolute bottom-3 right-4 text-[10px] font-extrabold text-text-muted">
                  {reason.length} / 300
                </span>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button type="submit" className="bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-extrabold py-3 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2">
                <SendIcon size={16} />
                Submit Request
              </button>
            </div>
          </form>
        </RequireRole>
      </div>

      {/* D. Allocation History Log Feed */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-base font-extrabold text-text-primary">Allocation history</h3>
        <div className="bg-white border border-border-color rounded-2xl p-5 shadow-sm">
          <ul className="flex flex-col gap-4 list-none p-0 m-0">
            {historyLogs.map((log) => (
              <li key={log.id} className="flex items-center gap-4 text-sm font-semibold text-text-primary pb-4 border-b border-border-color last:border-b-0 last:pb-0">
                {/* Visual indicator icon */}
                <div className="w-8 h-8 rounded-lg bg-bg-gray text-text-secondary flex items-center justify-center shrink-0">
                  <CalendarIcon size={16} />
                </div>
                
                {/* Timeline date */}
                <div className="text-xs font-extrabold text-text-secondary min-w-[50px]">
                  {log.date}
                </div>
                
                {/* Details snippet */}
                <div className="text-text-primary flex-grow">
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
