import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabaseClient';
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
import { useUserRole } from '../context/RoleContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_STYLES } from '../utils/permissions';

export default function OrgSetupPage() {
  const { role: currentUserRole } = useUserRole();
  const isAdmin = currentUserRole === ROLES.ADMIN;

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
  const [departments, setDepartments] = useState([]);
  const [deptForm, setDeptForm] = useState({ name: '', head: '', parent: '—', status: 'Active' });

  // ----------------------------------------------------
  // States & Form Handlers for CATEGORIES
  // ----------------------------------------------------
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: '', prefix: '', desc: '', status: 'Active' });

  // ----------------------------------------------------
  // States & Form Handlers for EMPLOYEES
  // ----------------------------------------------------
  const [employees, setEmployees] = useState([]);
  const [empForm, setEmpForm] = useState({ name: '', dept: 'Engineering', head: '', status: 'Active' });

  // ----------------------------------------------------
  // Promote Modal State (admin only)
  // ----------------------------------------------------
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState(null);   // { id, name, role }
  const [promoteRole, setPromoteRole] = useState(ROLES.ASSET_MANAGER);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteError, setPromoteError] = useState(null);

  // 1. Fetch departments, categories, and employees from Supabase on mount
  useEffect(() => {
    const loadOrgSetupData = async () => {
      try {
        // Load departments
        const { data: depts } = await supabase.from('departments').select('*');
        if (depts) {
          setDepartments(depts.map(d => ({
            id: d.id,
            name: d.name,
            head: d.head_id ? `Employee #${d.head_id}` : '—',
            parent: d.parent_department_id ? `Dept #${d.parent_department_id}` : '—',
            status: d.status,
            type: d.name.toLowerCase().includes('eng') ? 'eng' : d.name.toLowerCase().includes('fac') ? 'fac' : 'hr'
          })));
        }

        // Load categories
        const { data: cats } = await supabase.from('asset_categories').select('*');
        if (cats) {
          setCategories(cats.map(c => ({
            id: c.id,
            name: c.name,
            prefix: c.name.substring(0, 3).toUpperCase(),
            desc: c.custom_fields ? JSON.stringify(c.custom_fields) : '—',
            status: 'Active'
          })));
        }

        // Load employees — include role column
        const { data: emps } = await supabase.from('employees').select('id, name, email, role, department_id, status');
        if (emps) {
          setEmployees(emps.map(e => ({
            id: e.id,
            name: e.name,
            email: e.email,
            dept: e.department_id ? `Dept #${e.department_id}` : '—',
            head: '—',
            role: e.role || ROLES.EMPLOYEE,
            status: e.status
          })));
        }
      } catch (err) {
        console.error('Failed to load org data:', err);
      }
    };
    loadOrgSetupData();
  }, []);

  // Handle adding records dynamically depending on sub-tab
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (activeSubTab === 'departments') {
      if (!deptForm.name || !deptForm.head) return alert('Please fill in Name and Department Head');
      const { data, error } = await supabase
        .from('departments')
        .insert([{ name: deptForm.name, status: deptForm.status }])
        .select();

      if (error) {
        alert('Error creating department: ' + error.message);
      } else if (data && data[0]) {
        setDepartments([
          ...departments,
          {
            id: data[0].id,
            name: data[0].name,
            head: deptForm.head.toLowerCase(),
            parent: deptForm.parent,
            status: data[0].status,
            type: data[0].name.toLowerCase().includes('eng') ? 'eng' : data[0].name.toLowerCase().includes('fac') ? 'fac' : 'hr'
          }
        ]);
        setDeptForm({ name: '', head: '', parent: '—', status: 'Active' });
      }
    } else if (activeSubTab === 'categories') {
      if (!catForm.name || !catForm.prefix) return alert('Please fill in Name and Code Prefix');
      const { data, error } = await supabase
        .from('asset_categories')
        .insert([{ name: catForm.name, custom_fields: { description: catForm.desc } }])
        .select();

      if (error) {
        alert('Error creating category: ' + error.message);
      } else if (data && data[0]) {
        setCategories([
          ...categories,
          {
            id: data[0].id,
            name: data[0].name,
            prefix: catForm.prefix.toUpperCase(),
            desc: catForm.desc || '—',
            status: 'Active'
          }
        ]);
        setCatForm({ name: '', prefix: '', desc: '', status: 'Active' });
      }
    } else if (activeSubTab === 'employees') {
      if (!empForm.name || !empForm.head) return alert('Please fill in Name and Manager/Head Name');
      
      const email = `${empForm.name.toLowerCase().replace(/\s+/g, '')}@company.com`;
      const selectedDept = departments.find(d => d.name === empForm.dept);
      const departmentId = selectedDept ? selectedDept.id : null;

      const { data, error } = await supabase
        .from('employees')
        .insert([{ 
          name: empForm.name, 
          email, 
          role: 'employee',    // lowercase — matches user_role enum; DB trigger enforces this
          department_id: departmentId
        }])
        .select();

      if (error) {
        alert('Error creating employee: ' + error.message);
      } else if (data && data[0]) {
        setEmployees([
          ...employees,
          {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            dept: empForm.dept,
            head: empForm.head.toLowerCase(),
            role: data[0].role || ROLES.EMPLOYEE,
            status: data[0].status
          }
        ]);
        setEmpForm({ name: '', dept: 'Engineering', head: '', status: 'Active' });
      }
    }
    setShowAddModal(false);
  };

  // Row-level actions helpers
  const handleToggleStatus = async (id) => {
    if (activeSubTab === 'departments') {
      const dept = departments.find(d => d.id === id);
      if (!dept) return;
      const nextStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
      const { error } = await supabase.from('departments').update({ status: nextStatus }).eq('id', id);
      if (!error) {
        setDepartments(departments.map((d) => (d.id === id ? { ...d, status: nextStatus } : d)));
      }
    } else if (activeSubTab === 'categories') {
      setCategories(categories.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c)));
    } else if (activeSubTab === 'employees') {
      const emp = employees.find(e => e.id === id);
      if (!emp) return;
      const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
      const { error } = await supabase.from('employees').update({ status: nextStatus }).eq('id', id);
      if (!error) {
        setEmployees(employees.map((e) => (e.id === id ? { ...e, status: nextStatus } : e)));
      }
    }
    setActiveDropdownRow(null);
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (activeSubTab === 'departments') {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (!error) setDepartments(departments.filter((d) => d.id !== id));
      } else if (activeSubTab === 'categories') {
        const { error } = await supabase.from('asset_categories').delete().eq('id', id);
        if (!error) setCategories(categories.filter((c) => c.id !== id));
      } else if (activeSubTab === 'employees') {
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (!error) setEmployees(employees.filter((e) => e.id !== id));
      }
    }
    setActiveDropdownRow(null);
  };

  // ----------------------------------------------------
  // Promote Employee handler
  // ----------------------------------------------------
  const openPromoteModal = (emp) => {
    setPromoteTarget(emp);
    // Default to asset_manager if current role is employee/dept_head, else dept_head
    setPromoteRole(
      emp.role === ROLES.EMPLOYEE ? ROLES.ASSET_MANAGER : ROLES.DEPARTMENT_HEAD
    );
    setPromoteError(null);
    setShowPromoteModal(true);
    setActiveDropdownRow(null);
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    setPromoteLoading(true);
    setPromoteError(null);

    try {
      const { data, error } = await supabase.rpc('promote_employee', {
        target_employee_id: promoteTarget.id,
        new_role: promoteRole
      });

      if (error) {
        setPromoteError(error.message);
        return;
      }

      // The RPC returns a JSONB payload
      const result = data;
      if (!result?.success) {
        setPromoteError(result?.error || 'Promotion failed. Check RPC response.');
        return;
      }

      // Update local state
      setEmployees(employees.map(e =>
        e.id === promoteTarget.id ? { ...e, role: promoteRole } : e
      ));

      setShowPromoteModal(false);
      setPromoteTarget(null);
      alert(`${promoteTarget.name} has been promoted to ${ROLE_LABELS[promoteRole]}.`);
    } catch (err) {
      setPromoteError(err.message || 'Unexpected error during promotion.');
    } finally {
      setPromoteLoading(false);
    }
  };

  // ─── Role badge renderer ────────────────────────────────────
  const renderRoleBadge = (role) => {
    const styles = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES[ROLES.EMPLOYEE];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles.bg} ${styles.text} ${styles.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        {ROLE_LABELS[role] || role}
      </span>
    );
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
        bg: '#FFF4EF', // light orange background
        color: '#FF5A1F',
        Icon: UsersIcon
      };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Sub Tabs and Add Button Navigation Row */}
      <div className="flex justify-between items-center border-b border-border-color pb-3 gap-4 flex-wrap">
        <ul className="flex gap-2 p-0 m-0 list-none">
          <li>
            <button
              onClick={() => { setActiveSubTab('departments'); setActiveDropdownRow(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition duration-200 cursor-pointer ${
                activeSubTab === 'departments'
                  ? 'bg-primary-orange-light text-primary-orange border-primary-orange-border/30'
                  : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary border-transparent'
              }`}
            >
              <BuildingIcon size={16} />
              Departments
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveSubTab('categories'); setActiveDropdownRow(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition duration-200 cursor-pointer ${
                activeSubTab === 'categories'
                  ? 'bg-primary-orange-light text-primary-orange border-primary-orange-border/30'
                  : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary border-transparent'
              }`}
            >
              <TagIcon size={16} />
              Categories
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveSubTab('employees'); setActiveDropdownRow(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition duration-200 cursor-pointer ${
                activeSubTab === 'employees'
                  ? 'bg-primary-orange-light text-primary-orange border-primary-orange-border/30'
                  : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary border-transparent'
              }`}
            >
              <UsersIcon size={16} />
              Employee
            </button>
          </li>
        </ul>

        {/* Dynamic Add Trigger */}
        <button
          className="bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-extrabold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAddModal(true)}
        >
          <span className="text-base font-normal">+</span> Add
        </button>
      </div>

      {/* 2. Responsive Structured Data Table Cards */}
      <div className="bg-white border border-border-color rounded-2xl shadow-sm overflow-hidden">
        {activeSubTab === 'departments' && (
          <table className="w-full border-collapse text-left">
            <thead className="bg-bg-gray border-b border-border-color">
              <tr>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '40%' }}>Department</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '25%' }}>Head</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '15%' }}>Parent Dept</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '15%' }}>Status</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider w-[5%] text-center"></th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => {
                const config = getDeptIconConfig(dept.type);
                return (
                  <tr key={dept.id} className="border-b border-border-color last:border-b-0 hover:bg-bg-gray/30 transition-all">
                    <td className="p-4 text-sm font-medium text-text-primary">
                      <div className="flex items-center gap-3">
                        {/* Custom visual avatar container */}
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: config.bg, color: config.color }}
                        >
                          <config.Icon size={18} />
                        </div>
                        <span className="font-bold text-text-primary">{dept.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-text-primary capitalize">{dept.head}</td>
                    <td className="p-4 text-sm font-medium text-text-primary">{dept.parent}</td>
                    <td className="p-4 text-sm font-medium text-text-primary">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        dept.status === 'Active'
                          ? 'bg-success-green-bg text-success-green-text border-success-green-border/30'
                          : 'bg-red-50 text-alert-red-text border-alert-red-border/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dept.status === 'Active' ? 'bg-success-green-text' : 'bg-alert-red-text'}`} />
                        {dept.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-text-primary">
                      {/* Row actions dots dropdown */}
                      <div className="relative" ref={activeDropdownRow === dept.id ? dropdownRef : null}>
                        <button
                          className="w-8 h-8 rounded-lg text-text-secondary hover:bg-bg-gray hover:text-text-primary flex items-center justify-center transition cursor-pointer"
                          onClick={() => setActiveDropdownRow(activeDropdownRow === dept.id ? null : dept.id)}
                        >
                          <MoreVerticalIcon size={16} />
                        </button>
                        {activeDropdownRow === dept.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-border-color rounded-xl shadow-lg z-20 py-1">
                            <button 
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-bg-gray hover:text-text-primary transition"
                              onClick={() => handleToggleStatus(dept.id)}
                            >
                              Toggle Status
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-alert-red-text hover:bg-red-50 transition"
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
          <table className="w-full border-collapse text-left">
            <thead className="bg-bg-gray border-b border-border-color">
              <tr>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '30%' }}>Category Name</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '20%' }}>Code Prefix</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '30%' }}>Description</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '15%' }}>Status</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border-color last:border-b-0 hover:bg-bg-gray/30 transition-all">
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-orange-light text-primary-orange">
                        <TagIcon size={18} />
                      </div>
                      <span className="font-bold text-text-primary">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-text-primary"><code className="bg-bg-gray border border-border-color px-2 py-1 rounded text-xs font-mono">{cat.prefix}</code></td>
                  <td className="p-4 text-sm font-medium text-text-primary">{cat.desc}</td>
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      cat.status === 'Active'
                        ? 'bg-success-green-bg text-success-green-text border-success-green-border/30'
                        : 'bg-red-50 text-alert-red-text border-alert-red-border/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'Active' ? 'bg-success-green-text' : 'bg-alert-red-text'}`} />
                      {cat.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="relative" ref={activeDropdownRow === cat.id ? dropdownRef : null}>
                      <button
                        className="w-8 h-8 rounded-lg text-text-secondary hover:bg-bg-gray hover:text-text-primary flex items-center justify-center transition cursor-pointer"
                        onClick={() => setActiveDropdownRow(activeDropdownRow === cat.id ? null : cat.id)}
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                      {activeDropdownRow === cat.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-border-color rounded-xl shadow-lg z-20 py-1">
                          <button 
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-bg-gray hover:text-text-primary transition"
                            onClick={() => handleToggleStatus(cat.id)}
                          >
                            Toggle Status
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-alert-red-text hover:bg-red-50 transition"
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
          <table className="w-full border-collapse text-left">
            <thead className="bg-bg-gray border-b border-border-color">
              <tr>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '30%' }}>Employee Name</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '20%' }}>Department</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '18%' }}>Role</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '17%' }}>Manager / Head</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider" style={{ width: '10%' }}>Status</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-border-color last:border-b-0 hover:bg-bg-gray/30 transition-all">
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#EEF2F6] text-[#5F646D]">
                        <UsersIcon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{emp.name}</span>
                        {emp.email && <span className="text-[10px] text-text-muted font-medium">{emp.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-text-primary">{emp.dept}</td>
                  {/* Role badge column */}
                  <td className="p-4">
                    {renderRoleBadge(emp.role)}
                  </td>
                  <td className="p-4 text-sm font-medium text-text-primary capitalize">{emp.head}</td>
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      emp.status === 'Active'
                        ? 'bg-success-green-bg text-success-green-text border-success-green-border/30'
                        : 'bg-red-50 text-alert-red-text border-alert-red-border/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-success-green-text' : 'bg-alert-red-text'}`} />
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="relative" ref={activeDropdownRow === emp.id ? dropdownRef : null}>
                      <button
                        className="w-8 h-8 rounded-lg text-text-secondary hover:bg-bg-gray hover:text-text-primary flex items-center justify-center transition cursor-pointer"
                        onClick={() => setActiveDropdownRow(activeDropdownRow === emp.id ? null : emp.id)}
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                      {activeDropdownRow === emp.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-border-color rounded-xl shadow-lg z-20 py-1">
                          {/* Promote — visible to admin only */}
                          {isAdmin && emp.role !== ROLES.ADMIN && (
                            <button 
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 transition flex items-center gap-2"
                              onClick={() => openPromoteModal(emp)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                              Promote Role
                            </button>
                          )}
                          <button 
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-bg-gray hover:text-text-primary transition"
                            onClick={() => handleToggleStatus(emp.id)}
                          >
                            Toggle Status
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-alert-red-text hover:bg-red-50 transition"
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
      <div className="bg-primary-orange-light border border-primary-orange-border/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="text-primary-orange flex items-center shrink-0">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="text-xs font-semibold text-primary-orange leading-relaxed m-0">
          Editing a department here also drives the picklist in Screen 4 & 5
        </p>
      </div>

      {/* 4. Interactive Create Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form className="bg-white border border-border-color rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col gap-5 p-6" onSubmit={handleFormSubmit}>
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <h3 className="font-heading text-base font-extrabold text-text-primary">
                Add {activeSubTab === 'departments' ? 'Department' : activeSubTab === 'categories' ? 'Category' : 'Employee'}
              </h3>
              <button 
                type="button" 
                className="text-text-secondary hover:text-text-primary text-xl font-bold transition cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {/* A. DEPARTMENT FORM */}
            {activeSubTab === 'departments' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales, Operations"
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Department Head</label>
                  <input
                    type="text"
                    required
                    placeholder="Head of Department name"
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={deptForm.head}
                    onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Parent Department</label>
                  <select
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={deptForm.parent}
                    onChange={(e) => setDeptForm({ ...deptForm, parent: e.target.value })}
                  >
                    <option value="—">— (None)</option>
                    <option value="Field Ops">Field Ops</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Initial Status</label>
                  <select
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Network Devices"
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Code Prefix</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NET-DV"
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={catForm.prefix}
                    onChange={(e) => setCatForm({ ...catForm, prefix: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of the asset type"
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={catForm.desc}
                    onChange={(e) => setCatForm({ ...catForm, desc: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Initial Status</label>
                  <select
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Employee Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={empForm.name}
                    onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Department</label>
                  <select
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={empForm.dept}
                    onChange={(e) => setEmpForm({ ...empForm, dept: e.target.value })}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Reporting Manager / Head</label>
                  <input
                    type="text"
                    required
                    placeholder="Manager Name"
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={empForm.head}
                    onChange={(e) => setEmpForm({ ...empForm, head: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Initial Status</label>
                  <select
                    className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                    value={empForm.status}
                    onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border-color mt-2">
              <button 
                type="button" 
                className="border border-border-color bg-white hover:bg-bg-gray text-text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl transition cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer">
                Add Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Promote Employee Modal ───────────────────────────── */}
      {showPromoteModal && promoteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-border-color rounded-2xl shadow-xl max-w-sm w-full overflow-hidden flex flex-col gap-0">

            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-border-color">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100 text-purple-700 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                </div>
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-text-primary">Promote Employee</h3>
                  <p className="text-[11px] font-semibold text-text-secondary">{promoteTarget.name}</p>
                </div>
              </div>
              <button
                type="button"
                className="text-text-secondary hover:text-text-primary text-xl font-bold transition cursor-pointer"
                onClick={() => { setShowPromoteModal(false); setPromoteError(null); }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
              {/* Current role display */}
              <div className="flex items-center justify-between bg-bg-gray rounded-xl p-3">
                <span className="text-xs font-bold text-text-secondary">Current Role</span>
                {renderRoleBadge(promoteTarget.role)}
              </div>

              {/* New role picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Promote To</label>
                <div className="flex flex-col gap-2">
                  {[ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD].map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        promoteRole === r
                          ? 'border-primary-orange bg-primary-orange-light'
                          : 'border-border-color hover:bg-bg-gray'
                      }`}
                    >
                      <input
                        type="radio"
                        name="promoteRole"
                        value={r}
                        checked={promoteRole === r}
                        onChange={() => setPromoteRole(r)}
                        className="accent-primary-orange"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-text-primary">{ROLE_LABELS[r]}</span>
                        <span className="text-[10px] font-semibold text-text-secondary">
                          {r === ROLES.ASSET_MANAGER
                            ? 'Can register/allocate assets and approve maintenance'
                            : 'Can view & approve transfers in their department'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {promoteError && (
                <div className="bg-red-50 border border-alert-red-border/20 rounded-xl p-3 text-xs font-semibold text-alert-red-text">
                  {promoteError}
                </div>
              )}

              {/* Warning notice */}
              <div className="bg-primary-orange-light border border-primary-orange-border/20 rounded-xl p-3 text-[11px] font-semibold text-primary-orange">
                ⚠ This action is logged in the role change audit trail and cannot be silently undone.
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 pt-0">
              <button
                type="button"
                className="border border-border-color bg-white hover:bg-bg-gray text-text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl transition cursor-pointer"
                onClick={() => { setShowPromoteModal(false); setPromoteError(null); }}
                disabled={promoteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-extrabold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2"
                onClick={handlePromote}
                disabled={promoteLoading || promoteRole === promoteTarget.role}
              >
                {promoteLoading ? (
                  <>
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Promoting…
                  </>
                ) : 'Confirm Promotion'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
