import React, { useState, useEffect, useRef } from 'react';
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
  // 1. Handled by hoisted props from App.jsx

  // 2. Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // 3. Pagination State (Mock but fully functional)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 4. Modal & Dropdown UI State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeDropdownRow, setActiveDropdownRow] = useState(null);

  // Form State for new asset registration
  const [registerForm, setRegisterForm] = useState({
    name: '',
    tag: '',
    category: 'Electronics',
    status: 'Available',
    location: 'Bengaluru'
  });

  const dropdownRef = useRef(null);

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
    
    // In our mock, location/dept is mapped simply, we'll allow all matches for simplicity
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Paginated Assets computation
  const totalItems = filteredAssets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  // Add registered asset handler
  const handleRegisterSubmit = (e) => {
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

    const newAsset = {
      id: Date.now(),
      tag: registerForm.tag.toUpperCase(),
      name: registerForm.name,
      category: registerForm.category,
      status: registerForm.status,
      location: registerForm.location,
      type: computedType
    };

    setAssets([newAsset, ...assets]);
    setShowRegisterModal(false);
    // Reset form
    setRegisterForm({
      name: '',
      tag: '',
      category: 'Electronics',
      status: 'Available',
      location: 'Bengaluru'
    });
  };

  // Delete row handler
  const handleDeleteAsset = (id) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
    setActiveDropdownRow(null);
  };

  // Toggle status cycle
  const handleCycleStatus = (id) => {
    const statuses = ['Available', 'Allocated', 'Maintenance'];
    setAssets(
      assets.map((a) => {
        if (a.id === id) {
          const nextIndex = (statuses.indexOf(a.status) + 1) % statuses.length;
          return { ...a, status: statuses[nextIndex] };
        }
        return a;
      })
    );
    setActiveDropdownRow(null);
  };

  // Helper to retrieve the appropriate asset type icon
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

  // Helper to render Category Tags
  const renderCategoryTag = (category) => {
    const lower = category.toLowerCase();
    if (lower.includes('elect')) {
      return <span className="category-tag electronics">Electronics</span>;
    } else if (lower.includes('furn')) {
      return <span className="category-tag furniture">Furniture</span>;
    } else {
      return <span className="category-tag other">{category}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Search Bar & Primary Button Row */}
      <div className="search-bar-row">
        <div className="search-input-wrap">
          <SearchIcon size={18} className="search-icon" />
          <input
            type="text"
            className="search-field"
            placeholder="Search by tag, serial, or QR code.."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button
          className="btn-primary-orange"
          onClick={() => setShowRegisterModal(true)}
          style={{ padding: '12px 24px', borderRadius: '12px' }}
        >
          + Register Asset
        </button>
      </div>

      {/* 2. Filters Grid Row */}
      <div className="filters-row">
        {/* Category Filter */}
        <div className="filter-select-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">Category: All</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
          </select>
          <ChevronDownIcon size={14} className="select-chevron" />
        </div>

        {/* Status Filter */}
        <div className="filter-select-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <ChevronDownIcon size={14} className="select-chevron" />
        </div>

        {/* Department Filter */}
        <div className="filter-select-wrap">
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">Department: All</option>
            <option value="Engineering">Engineering</option>
            <option value="Facilities">Facilities</option>
            <option value="HR">HR</option>
          </select>
          <ChevronDownIcon size={14} className="select-chevron" />
        </div>

        {/* Reset Filters button */}
        <button className="btn-reset" onClick={handleResetFilters}>
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
            className="reset-icon"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Reset
        </button>
      </div>

      {/* 3. Assets Table Card */}
      <div className="data-table-card" style={{ marginBottom: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Tag / Serial</th>
              <th style={{ width: '25%' }}>Name</th>
              <th style={{ width: '18%' }}>Category</th>
              <th style={{ width: '15%' }}>Status</th>
              <th style={{ width: '12%' }}>Location</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((asset) => {
                const IconComponent = getAssetIcon(asset.type);
                return (
                  <tr key={asset.id}>
                    {/* Tag / Serial with visual decorator */}
                    <td>
                      <div className="dept-cell-wrap">
                        <div 
                          className="dept-icon-box"
                          style={{ backgroundColor: '#FFF4EF', color: '#FF5A1F' }}
                        >
                          <IconComponent size={18} />
                        </div>
                        <span className="dept-name" style={{ fontWeight: '700' }}>
                          {asset.tag}
                        </span>
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td>{asset.name}</td>
                    
                    {/* Category Tag */}
                    <td>{renderCategoryTag(asset.category)}</td>
                    
                    {/* Status Pill */}
                    <td>
                      <span className={`status-badge ${asset.status.toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {asset.status}
                      </span>
                    </td>
                    
                    {/* Location */}
                    <td>{asset.location}</td>
                    
                    {/* Actions Dots dropdown */}
                    <td>
                      <div className="action-menu-container" ref={activeDropdownRow === asset.id ? dropdownRef : null}>
                        <button
                          className="action-dots-btn"
                          onClick={() => setActiveDropdownRow(activeDropdownRow === asset.id ? null : asset.id)}
                        >
                          <MoreVerticalIcon size={16} />
                        </button>
                        {activeDropdownRow === asset.id && (
                          <div className="action-dropdown-menu">
                            <button 
                              className="action-dropdown-item"
                              onClick={() => handleCycleStatus(asset.id)}
                            >
                              Cycle Status
                            </button>
                            <button 
                              className="action-dropdown-item danger"
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No assets found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 4. Table Pagination controls footer */}
        <div className="pagination-row">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} assets
          </div>
          
          <div className="pagination-controls">
            {/* Page Index lists */}
            <ul className="pagination-pages">
              <li>
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon size={14} />
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <li key={pg}>
                  <button
                    className={`pagination-btn ${currentPage === pg ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pg)}
                  >
                    {pg}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  <ChevronRightIcon size={14} />
                </button>
              </li>
            </ul>

            {/* Items Per Page dropdown (mock functionality) */}
            <div className="pagination-select-wrap">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronDownIcon size={12} className="select-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Disclaimer Alert Info Box */}
      <div className="info-banner">
        <div className="info-banner-icon">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="info-banner-text">
          Editing an asset here also drives the picklist in Screen 5 (Allocation & Transfer).
        </p>
      </div>

      {/* 6. Register Asset Modal Dialogue */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleRegisterSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">Register Asset</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowRegisterModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Asset Name</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro, Sony Projector"
                className="form-input"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tag / Serial Number</label>
              <input
                type="text"
                required
                placeholder="e.g. AF-0943"
                className="form-input"
                value={registerForm.tag}
                onChange={(e) => setRegisterForm({ ...registerForm, tag: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={registerForm.category}
                onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
              >
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={registerForm.status}
                onChange={(e) => setRegisterForm({ ...registerForm, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, HQ Floor 1"
                className="form-input"
                value={registerForm.location}
                onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Register
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
