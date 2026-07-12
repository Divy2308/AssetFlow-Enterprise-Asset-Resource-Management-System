import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabaseClient';
import { aiService } from '../services/aiService';
import AssetDetailPanel from '../components/AssetDetailPanel';
import {
  SearchIcon,
  LaptopIcon,
  ProjectorIcon,
  ChairIcon,
  BoxIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  InfoIcon
} from '../components/Icons';

export default function AssetsPage({ assets, setAssets }) {
  // 1. Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // 2. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 3. Modal & Dropdown UI State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeDropdownRow, setActiveDropdownRow] = useState(null);

  // 4. Phase 2 AI Health State
  const [selectedAssetForHealth, setSelectedAssetForHealth] = useState(null);
  const [healthScoreMap, setHealthScoreMap] = useState({});

  // Form State for new asset registration
  const [registerForm, setRegisterForm] = useState({
    name: '',
    tag: '',
    category: 'Electronics',
    status: 'Available',
    location: 'Bengaluru'
  });

  const dropdownRef = useRef(null);

  // Load batch cached health scores on mount
  useEffect(() => {
    let isMounted = true;
    aiService.getAllCachedHealthScores().then(map => {
      if (isMounted) setHealthScoreMap(map);
    });
    return () => { isMounted = false; };
  }, []);

  // Close dropdown menu if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownRow(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset all search fields and filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setDeptFilter('All');
    setCurrentPage(1);
  };

  // Filtered Assets logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Paginated Assets computation
  const totalItems = filteredAssets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  // Add registered asset handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.tag) {
      return alert('Please fill in Name and Tag/Serial number.');
    }

    const typeStr = registerForm.name.toLowerCase();
    let computedType = 'other';
    if (typeStr.includes('laptop') || typeStr.includes('computer') || typeStr.includes('dell') || typeStr.includes('macbook')) {
      computedType = 'laptop';
    } else if (typeStr.includes('projector') || typeStr.includes('screen')) {
      computedType = 'projector';
    } else if (typeStr.includes('chair') || typeStr.includes('table') || typeStr.includes('desk') || typeStr.includes('furniture')) {
      computedType = 'chair';
    }

    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([
          {
            tag: registerForm.tag.toUpperCase(),
            name: registerForm.name,
            category_name: registerForm.category,
            status: registerForm.status === 'Available' ? 'AVAILABLE' : registerForm.status === 'Allocated' ? 'ALLOCATED' : 'UNDER_MAINTENANCE',
            location: registerForm.location,
            type: computedType,
            serial_number: `SN-${registerForm.tag.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
            acquisition_date: new Date().toISOString(),
            acquisition_cost: 1200.00,
            condition: 'Good'
          }
        ])
        .select();

      if (error) {
        alert('Failed to register asset: ' + error.message);
      } else if (data && data[0]) {
        const newAsset = {
          id: data[0].id,
          tag: data[0].tag,
          name: data[0].name,
          category: data[0].category_name,
          status: data[0].status === 'AVAILABLE' ? 'Available' : data[0].status === 'ALLOCATED' ? 'Allocated' : 'Maintenance',
          location: data[0].location,
          type: data[0].type,
          owner: '—'
        };

        setAssets([newAsset, ...assets]);
        setShowRegisterModal(false);
        setRegisterForm({
          name: '',
          tag: '',
          category: 'Electronics',
          status: 'Available',
          location: 'Bengaluru'
        });
      }
    } catch (err) {
      console.error('Error registering asset:', err);
    }
  };

  // Delete row handler
  const handleDeleteAsset = async (id) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', id);

        if (error) {
          alert('Failed to delete asset: ' + error.message);
        } else {
          setAssets(assets.filter(a => a.id !== id));
        }
      } catch (err) {
        console.error('Error deleting asset:', err);
      }
    }
    setActiveDropdownRow(null);
  };

  // Toggle status cycle
  const handleCycleStatus = async (id) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    const statuses = ['Available', 'Allocated', 'Maintenance'];
    const nextIndex = (statuses.indexOf(asset.status) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    const dbStatusMap = {
      'Available': 'AVAILABLE',
      'Allocated': 'ALLOCATED',
      'Maintenance': 'UNDER_MAINTENANCE'
    };

    try {
      const { error } = await supabase
        .from('assets')
        .update({ status: dbStatusMap[nextStatus] })
        .eq('id', id);

      if (error) {
        alert('Failed to update status: ' + error.message);
      } else {
        setAssets(
          assets.map((a) => {
            if (a.id === id) {
              return { ...a, status: nextStatus };
            }
            return a;
          })
        );
      }
    } catch (err) {
      console.error('Error cycling status:', err);
    }
    setActiveDropdownRow(null);
  };

  // Helper to retrieve the appropriate asset type icon
  const getAssetIcon = (type) => {
    switch (type) {
      case 'laptop': return LaptopIcon;
      case 'projector': return ProjectorIcon;
      case 'chair': return ChairIcon;
      default: return BoxIcon;
    }
  };

  // Helper to render Category Tags
  const renderCategoryTag = (category) => {
    const lower = category.toLowerCase();
    if (lower.includes('elect')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-orange-light text-primary-orange border border-primary-orange-border/20">
          Electronics
        </span>
      );
    } else if (lower.includes('furn')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
          Furniture
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-bg-gray text-text-secondary border border-border-color">
          {category}
        </span>
      );
    }
  };

  const getHealthBadgeStyle = (scoreObj) => {
    if (!scoreObj || typeof scoreObj.healthScore !== 'number') {
      return { className: 'bg-bg-gray text-text-secondary border-border-color hover:border-primary-orange', text: '📊 Analyze Health' };
    }
    const score = scoreObj.healthScore;
    if (score >= 80) return { className: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100', text: `🟢 ${score}/100 Healthy` };
    if (score >= 60) return { className: 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100', text: `🟡 ${score}/100 Monitor` };
    if (score >= 40) return { className: 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100', text: `🟠 ${score}/100 Attention` };
    return { className: 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100', text: `🔴 ${score}/100 Critical` };
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Search Bar & Primary Button Row */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="relative flex-grow max-w-md h-12">
          <SearchIcon size={18} className="absolute left-4 top-3.5 text-text-secondary" />
          <input
            type="text"
            className="w-full h-full border border-border-color bg-white pl-11 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-orange text-text-primary placeholder:text-text-muted"
            placeholder="Search by tag, serial, or QR code.."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button
          className="bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-extrabold py-3 px-6 rounded-xl transition shadow-sm cursor-pointer"
          onClick={() => setShowRegisterModal(true)}
        >
          + Register Asset
        </button>
      </div>

      {/* 2. Filters Grid Row */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative w-44">
          <select
            value={categoryFilter}
            className="w-full border border-border-color bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary focus:outline-none focus:border-primary-orange appearance-none pr-9 cursor-pointer"
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">Category: All</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
          </select>
          <ChevronDownIcon size={12} className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" />
        </div>

        <div className="relative w-44">
          <select
            value={statusFilter}
            className="w-full border border-border-color bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary focus:outline-none focus:border-primary-orange appearance-none pr-9 cursor-pointer"
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <ChevronDownIcon size={12} className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" />
        </div>

        <div className="relative w-44">
          <select
            value={deptFilter}
            className="w-full border border-border-color bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary focus:outline-none focus:border-primary-orange appearance-none pr-9 cursor-pointer"
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">Department: All</option>
            <option value="Engineering">Engineering</option>
            <option value="Facilities">Facilities</option>
            <option value="HR">HR</option>
          </select>
          <ChevronDownIcon size={12} className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" />
        </div>

        <button className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary-orange transition cursor-pointer" onClick={handleResetFilters}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Reset
        </button>
      </div>

      {/* 3. Assets Table Card */}
      <div className="bg-white border border-border-color rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-bg-gray border-b border-border-color">
            <tr>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '22%' }}>Tag / Serial</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '22%' }}>Name</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '15%' }}>Category</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '13%' }}>Status</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '13%' }}>Location</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '10%' }}>AI Health</th>
              <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider w-[5%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((asset) => {
                const IconComponent = getAssetIcon(asset.type);
                const healthInfo = getHealthBadgeStyle(healthScoreMap[asset.id]);
                return (
                  <tr key={asset.id} className="border-b border-border-color last:border-b-0 hover:bg-bg-gray/30 transition-all">
                    {/* Tag / Serial */}
                    <td className="p-4 text-sm font-medium text-text-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-orange-light text-primary-orange">
                          <IconComponent size={18} />
                        </div>
                        <span className="font-extrabold text-text-primary">
                          {asset.tag}
                        </span>
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td className="p-4 text-sm font-medium text-text-primary">{asset.name}</td>
                    
                    {/* Category Tag */}
                    <td className="p-4 text-sm font-medium text-text-primary">{renderCategoryTag(asset.category)}</td>
                    
                    {/* Status Pill */}
                    <td className="p-4 text-sm font-medium text-text-primary">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        asset.status === 'Available'
                          ? 'bg-success-green-bg text-success-green-text border-success-green-border/30'
                          : asset.status === 'Allocated'
                          ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#EFF6FF]'
                          : 'bg-primary-orange-light text-primary-orange border-primary-orange-border/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          asset.status === 'Available'
                            ? 'bg-success-green-text'
                            : asset.status === 'Allocated'
                            ? 'bg-[#3B82F6]'
                            : 'bg-primary-orange'
                        }`} />
                        {asset.status}
                      </span>
                    </td>
                    
                    {/* Location */}
                    <td className="p-4 text-sm font-medium text-text-primary">{asset.location}</td>
                    
                    {/* AI Health Badge (Clickable) */}
                    <td className="p-4 text-sm font-medium text-text-primary">
                      <button
                        type="button"
                        onClick={() => setSelectedAssetForHealth(asset)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition shadow-2xs cursor-pointer ${healthInfo.className}`}
                        title="Click to view full AI Reliability breakdown & factors"
                      >
                        <span>{healthInfo.text}</span>
                      </button>
                    </td>

                    {/* Actions Dots dropdown */}
                    <td className="p-4 text-sm font-medium text-text-primary">
                      <div className="relative" ref={activeDropdownRow === asset.id ? dropdownRef : null}>
                        <button
                          className="w-8 h-8 rounded-lg text-text-secondary hover:bg-bg-gray hover:text-text-primary flex items-center justify-center transition cursor-pointer mx-auto"
                          onClick={() => setActiveDropdownRow(activeDropdownRow === asset.id ? null : asset.id)}
                        >
                          <MoreVerticalIcon size={16} />
                        </button>
                        {activeDropdownRow === asset.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-border-color rounded-xl shadow-lg z-20 py-1">
                            <button 
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-bg-gray hover:text-text-primary transition"
                              onClick={() => handleCycleStatus(asset.id)}
                            >
                              Cycle Status
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-alert-red-text hover:bg-red-50 transition"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-10 text-sm font-bold text-text-secondary text-center">
                  No assets found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 4. Table Pagination controls footer */}
        <div className="flex justify-between items-center text-xs font-bold text-text-secondary p-4 border-t border-border-color flex-wrap gap-4">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} assets
          </div>
          
          <div className="flex items-center gap-4">
            <ul className="flex gap-1.5 list-none m-0 p-0">
              <li>
                <button
                  className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center transition cursor-pointer text-xs font-extrabold text-text-secondary hover:bg-bg-gray hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeftIcon size={14} />
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <li key={pg}>
                  <button
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer text-xs font-extrabold ${
                      currentPage === pg
                        ? 'bg-primary-orange-light text-primary-orange border-primary-orange-border/30'
                        : 'border-transparent hover:bg-bg-gray text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setCurrentPage(pg)}
                  >
                    {pg}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center transition cursor-pointer text-xs font-extrabold text-text-secondary hover:bg-bg-gray hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRightIcon size={14} />
                </button>
              </li>
            </ul>

            <div className="relative w-28">
              <select
                value={itemsPerPage}
                className="w-full border border-border-color bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-text-primary focus:outline-none focus:border-primary-orange appearance-none pr-7 cursor-pointer"
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronDownIcon size={12} className="absolute right-2.5 top-2.5 text-text-secondary pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Disclaimer Alert Info Box */}
      <div className="bg-primary-orange-light border border-primary-orange-border/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="text-primary-orange flex items-center shrink-0">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="text-xs font-semibold text-primary-orange leading-relaxed m-0">
          Click any <strong className="font-extrabold">AI Health</strong> badge in the table above to open the full diagnostic breakdown and lifecycle forecast panel.
        </p>
      </div>

      {/* 6. Register Asset Modal Dialogue */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form className="bg-white border border-border-color rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col gap-5 p-6" onSubmit={handleRegisterSubmit}>
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <h3 className="font-heading text-base font-extrabold text-text-primary">Register Asset</h3>
              <button 
                type="button" 
                className="text-text-secondary hover:text-text-primary text-xl font-bold transition cursor-pointer"
                onClick={() => setShowRegisterModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Asset Name</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro, Sony Projector"
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tag / Serial Number</label>
              <input
                type="text"
                required
                placeholder="e.g. AF-0943"
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={registerForm.tag}
                onChange={(e) => setRegisterForm({ ...registerForm, tag: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category</label>
              <select
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={registerForm.category}
                onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
              >
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Initial Status</label>
              <select
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={registerForm.status}
                onChange={(e) => setRegisterForm({ ...registerForm, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, HQ Floor 1"
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={registerForm.location}
                onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-color mt-2">
              <button 
                type="button" 
                className="border border-border-color bg-white hover:bg-bg-gray text-text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl transition cursor-pointer"
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer">
                Register
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Phase 2 AI Asset Detail & Health Breakdown Slide-in Panel */}
      <AssetDetailPanel
        asset={selectedAssetForHealth}
        onClose={() => setSelectedAssetForHealth(null)}
        onScoreUpdated={(id, newScoreData) => {
          setHealthScoreMap(prev => ({ ...prev, [id]: newScoreData }));
        }}
      />

    </div>
  );
}
