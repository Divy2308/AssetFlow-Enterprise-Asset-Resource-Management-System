import React, { useState, useEffect, useRef } from 'react';
import {
  OrgSetupIcon,
  TagIcon,
  UsersIcon,
  MoreVerticalIcon,
  InfoIcon,
  SettingsIcon,
  BuildingIcon,
  ChevronRightIcon
} from '../components/Icons';

export default function OrgSetupPage() {
  const [activeSubTab, setActiveSubTab] = useState('departments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdownRow, setActiveDropdownRow] = useState(null); // Track open actions menu row id

  // Ref to handle clicks outside the row actions menu
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownRow(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----------------------------------------------------
  // States & Form Handlers for DEPARTMENTS
  // ----------------------------------------------------
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Engineering', head: 'aditi rao', parent: '—', status: 'Active', type: 'eng' },
    { id: 2, name: 'Facilities', head: 'rohan mehta', parent: '—', status: 'Active', type: 'fac' },
    { id: 3, name: 'Human Resources (HR)', head: 'sana iqbal', parent: 'Field Ops', status: 'Inactive', type: 'hr' }
  ]);
  const [deptForm, setDeptForm] = useState({ name: '', head: '', parent: '—', status: 'Active' });

  // ----------------------------------------------------
  // States & Form Handlers for CATEGORIES
  // ----------------------------------------------------
  const [categories, setCategories] = useState([
    { id: 1, name: 'IT Equipment', prefix: 'IT-EQ', desc: 'Laptops, Monitors, Keyboards, etc.', status: 'Active' },
    { id: 2, name: 'Office Furniture', prefix: 'OFF-FN', desc: 'Chairs, Desks, Storage units', status: 'Active' },
    { id: 3, name: 'Audio/Visual', prefix: 'AV-SYS', desc: 'Projectors, Microphones, Speakers', status: 'Active' }
  ]);
  const [catForm, setCatForm] = useState({ name: '', prefix: '', desc: '', status: 'Active' });

  // ----------------------------------------------------
  // States & Form Handlers for EMPLOYEES
  // ----------------------------------------------------
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Priya', dept: 'Engineering', head: 'aditi rao', status: 'Active' },
    { id: 2, name: 'Manya Anand', dept: 'Facilities', head: 'rohan mehta', status: 'Active' },
    { id: 3, name: 'Elroy M', dept: 'Engineering', head: 'aditi rao', status: 'Active' },
    { id: 4, name: 'Chintan Varma', dept: 'Human Resources (HR)', head: 'sana iqbal', status: 'Active' }
  ]);
  const [empForm, setEmpForm] = useState({ name: '', dept: 'Engineering', head: '', status: 'Active' });

  // Handle adding records dynamically depending on sub-tab
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (activeSubTab === 'departments') {
      if (!deptForm.name || !deptForm.head) return alert('Please fill in Name and Department Head');
      setDepartments([
        ...departments,
        {
          id: Date.now(),
          name: deptForm.name,
          head: deptForm.head.toLowerCase(),
          parent: deptForm.parent,
          status: deptForm.status,
          type: deptForm.name.toLowerCase().includes('eng') ? 'eng' : deptForm.name.toLowerCase().includes('fac') ? 'fac' : 'hr'
        }
      ]);
      setDeptForm({ name: '', head: '', parent: '—', status: 'Active' });
    } else if (activeSubTab === 'categories') {
      if (!catForm.name || !catForm.prefix) return alert('Please fill in Name and Code Prefix');
      setCategories([
        ...categories,
        {
          id: Date.now(),
          name: catForm.name,
          prefix: catForm.prefix.toUpperCase(),
          desc: catForm.desc || '—',
          status: catForm.status
        }
      ]);
      setCatForm({ name: '', prefix: '', desc: '', status: 'Active' });
    } else if (activeSubTab === 'employees') {
      if (!empForm.name || !empForm.head) return alert('Please fill in Name and Manager/Head Name');
      setEmployees([
        ...employees,
        {
          id: Date.now(),
          name: empForm.name,
          dept: empForm.dept,
          head: empForm.head.toLowerCase(),
          status: empForm.status
        }
      ]);
      setEmpForm({ name: '', dept: 'Engineering', head: '', status: 'Active' });
    }
    setShowAddModal(false);
  };

  // Row-level actions helpers
  const handleToggleStatus = (id) => {
    if (activeSubTab === 'departments') {
      setDepartments(
        departments.map((d) => (d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d))
      );
    } else if (activeSubTab === 'categories') {
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
      );
    } else if (activeSubTab === 'employees') {
      setEmployees(
        employees.map((e) => (e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e))
      );
    }
    setActiveDropdownRow(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (activeSubTab === 'departments') {
        setDepartments(departments.filter((d) => d.id !== id));
      } else if (activeSubTab === 'categories') {
        setCategories(categories.filter((c) => c.id !== id));
      } else if (activeSubTab === 'employees') {
        setEmployees(employees.filter((e) => e.id !== id));
      }
    }
    setActiveDropdownRow(null);
  };

  // Utility to render avatar containers matching mockup colors
  const getDeptIconConfig = (type) => {
    if (type === 'eng') {
      return {
        bg: '#F5F3FF', // light purple background
        color: '#8A5CF5',
        Icon: SettingsIcon
      };
    } else if (type === 'fac') {
      return {
        bg: '#EFF6FF', // light blue background
        color: '#3B82F6',
        Icon: BuildingIcon
      };
    } else {
      return {
        bg: '#FFF7ED', // light orange background
        color: '#FF5A1F',
        Icon: UsersIcon
      };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Sub Tabs and Add Button Navigation Row */}
      <div className="sub-tabs-row">
        <ul className="sub-tabs-list">
          <li>
            <button
              onClick={() => { setActiveSubTab('departments'); setActiveDropdownRow(null); }}
              className={`sub-tab-btn ${activeSubTab === 'departments' ? 'active' : ''}`}
            >
              <BuildingIcon size={16} className="tab-icon" />
              Departments
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveSubTab('categories'); setActiveDropdownRow(null); }}
              className={`sub-tab-btn ${activeSubTab === 'categories' ? 'active' : ''}`}
            >
              <TagIcon size={16} className="tab-icon" />
              Categories
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveSubTab('employees'); setActiveDropdownRow(null); }}
              className={`sub-tab-btn ${activeSubTab === 'employees' ? 'active' : ''}`}
            >
              <UsersIcon size={16} className="tab-icon" />
              Employee
            </button>
          </li>
        </ul>

        {/* Dynamic Add Trigger */}
        <button
          className="btn-add-primary"
          onClick={() => setShowAddModal(true)}
        >
          <span>+</span> Add
        </button>
      </div>

      {/* 2. Responsive Structured Data Table Cards */}
      <div className="data-table-card">
        {activeSubTab === 'departments' && (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Department</th>
                <th style={{ width: '25%' }}>Head</th>
                <th style={{ width: '15%' }}>Parent Dept</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '5%', textAlignment: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => {
                const config = getDeptIconConfig(dept.type);
                return (
                  <tr key={dept.id}>
                    <td>
                      <div className="dept-cell-wrap">
                        {/* Custom visual avatar container */}
                        <div 
                          className="dept-icon-box"
                          style={{ backgroundColor: config.bg, color: config.color }}
                        >
                          <config.Icon size={18} />
                        </div>
                        <span className="dept-name">{dept.name}</span>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{dept.head}</td>
                    <td>{dept.parent}</td>
                    <td>
                      <span className={`status-badge ${dept.status === 'Active' ? 'active' : 'inactive'}`}>
                        <span className="status-dot"></span>
                        {dept.status}
                      </span>
                    </td>
                    <td>
                      {/* Row actions dots dropdown */}
                      <div className="action-menu-container" ref={activeDropdownRow === dept.id ? dropdownRef : null}>
                        <button
                          className="action-dots-btn"
                          onClick={() => setActiveDropdownRow(activeDropdownRow === dept.id ? null : dept.id)}
                        >
                          <MoreVerticalIcon size={16} />
                        </button>
                        {activeDropdownRow === dept.id && (
                          <div className="action-dropdown-menu">
                            <button 
                              className="action-dropdown-item"
                              onClick={() => handleToggleStatus(dept.id)}
                            >
                              Toggle Status
                            </button>
                            <button 
                              className="action-dropdown-item danger"
                              onClick={() => handleDeleteItem(dept.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeSubTab === 'categories' && (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Category Name</th>
                <th style={{ width: '20%' }}>Code Prefix</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div className="dept-cell-wrap">
                      <div 
                        className="dept-icon-box"
                        style={{ backgroundColor: '#FFF4EF', color: '#FF5A1F' }}
                      >
                        <TagIcon size={18} />
                      </div>
                      <span className="dept-name">{cat.name}</span>
                    </div>
                  </td>
                  <td><code>{cat.prefix}</code></td>
                  <td>{cat.desc}</td>
                  <td>
                    <span className={`status-badge ${cat.status === 'Active' ? 'active' : 'inactive'}`}>
                      <span className="status-dot"></span>
                      {cat.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-menu-container" ref={activeDropdownRow === cat.id ? dropdownRef : null}>
                      <button
                        className="action-dots-btn"
                        onClick={() => setActiveDropdownRow(activeDropdownRow === cat.id ? null : cat.id)}
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                      {activeDropdownRow === cat.id && (
                        <div className="action-dropdown-menu">
                          <button 
                            className="action-dropdown-item"
                            onClick={() => handleToggleStatus(cat.id)}
                          >
                            Toggle Status
                          </button>
                          <button 
                            className="action-dropdown-item danger"
                            onClick={() => handleDeleteItem(cat.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeSubTab === 'employees' && (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Employee Name</th>
                <th style={{ width: '25%' }}>Department</th>
                <th style={{ width: '20%' }}>Manager / Head</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="dept-cell-wrap">
                      <div 
                        className="dept-icon-box"
                        style={{ backgroundColor: '#EEF2F6', color: '#5F646D' }}
                      >
                        <UsersIcon size={18} />
                      </div>
                      <span className="dept-name">{emp.name}</span>
                    </div>
                  </td>
                  <td>{emp.dept}</td>
                  <td style={{ textTransform: 'capitalize' }}>{emp.head}</td>
                  <td>
                    <span className={`status-badge ${emp.status === 'Active' ? 'active' : 'inactive'}`}>
                      <span className="status-dot"></span>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-menu-container" ref={activeDropdownRow === emp.id ? dropdownRef : null}>
                      <button
                        className="action-dots-btn"
                        onClick={() => setActiveDropdownRow(activeDropdownRow === emp.id ? null : emp.id)}
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                      {activeDropdownRow === emp.id && (
                        <div className="action-dropdown-menu">
                          <button 
                            className="action-dropdown-item"
                            onClick={() => handleToggleStatus(emp.id)}
                          >
                            Toggle Status
                          </button>
                          <button 
                            className="action-dropdown-item danger"
                            onClick={() => handleDeleteItem(emp.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Orange Information Alert Banner (placed below the table card) */}
      <div className="info-banner">
        <div className="info-banner-icon">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="info-banner-text">
          Editing a department here also drives the picklist in Screen 4 & 5
        </p>
      </div>

      {/* 4. Interactive Create Modal Popup */}
      {showAddModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleFormSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">
                Add {activeSubTab === 'departments' ? 'Department' : activeSubTab === 'categories' ? 'Category' : 'Employee'}
              </h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {/* A. DEPARTMENT FORM */}
            {activeSubTab === 'departments' && (
              <>
                <div className="form-group">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales, Operations"
                    className="form-input"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Head</label>
                  <input
                    type="text"
                    required
                    placeholder="Head of Department full name"
                    className="form-input"
                    value={deptForm.head}
                    onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Department</label>
                  <select
                    className="form-select"
                    value={deptForm.parent}
                    onChange={(e) => setDeptForm({ ...deptForm, parent: e.target.value })}
                  >
                    <option value="—">— (None)</option>
                    <option value="Field Ops">Field Ops</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={deptForm.status}
                    onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </>
            )}

            {/* B. CATEGORY FORM */}
            {activeSubTab === 'categories' && (
              <>
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Network Devices"
                    className="form-input"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Code Prefix</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NET-DV"
                    className="form-input"
                    value={catForm.prefix}
                    onChange={(e) => setCatForm({ ...catForm, prefix: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of the asset type"
                    className="form-input"
                    value={catForm.desc}
                    onChange={(e) => setCatForm({ ...catForm, desc: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={catForm.status}
                    onChange={(e) => setCatForm({ ...catForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </>
            )}

            {/* C. EMPLOYEE FORM */}
            {activeSubTab === 'employees' && (
              <>
                <div className="form-group">
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="form-input"
                    value={empForm.name}
                    onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={empForm.dept}
                    onChange={(e) => setEmpForm({ ...empForm, dept: e.target.value })}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reporting Manager / Head</label>
                  <input
                    type="text"
                    required
                    placeholder="Manager Name"
                    className="form-input"
                    value={empForm.head}
                    onChange={(e) => setEmpForm({ ...empForm, head: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={empForm.status}
                    onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Add Record
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
