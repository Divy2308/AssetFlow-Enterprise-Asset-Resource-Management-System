import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { aiService } from '../services/aiService';
import {
  CalendarIcon,
  InfoIcon,
  BulbIcon,
  AcUnitIcon,
  PrinterIcon,
  WrenchIcon,
  ChairIcon,
  BoxIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  SettingsIcon
} from '../components/Icons';
import { useUserRole } from '../context/RoleContext';
import { ROLES, hasPermission } from '../utils/permissions';

export default function MaintenancePage({ assets = [], setAssets }) {
  const { role } = useUserRole();
  const canApproveMaintenance = hasPermission(role, 'approve_maintenance');

  // 1. Initial State for Kanban Tasks
  const [tasks, setTasks] = useState([]);

  // Load tasks on mount from Supabase
  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      try {
        const { data, error } = await supabase.from('maintenance_requests').select('*, assets(tag)');
        if (data) {
          setTasks(data.map(t => {
            const lowerTitle = t.issue_details.toLowerCase();
            let iconType = 'box';
            let iconColor = 'orange';

            if (lowerTitle.includes('bulb') || lowerTitle.includes('light') || lowerTitle.includes('projector')) {
              iconType = 'bulb';
              iconColor = 'orange';
            } else if (lowerTitle.includes('ac') || lowerTitle.includes('compressor') || lowerTitle.includes('cooling')) {
              iconType = 'ac';
              iconColor = 'green';
            } else if (lowerTitle.includes('print') || lowerTitle.includes('paper') || lowerTitle.includes('jam')) {
              iconType = 'printer';
              iconColor = 'purple';
            } else if (lowerTitle.includes('wrench') || lowerTitle.includes('tool') || lowerTitle.includes('forklift') || lowerTitle.includes('engine')) {
              iconType = 'wrench';
              iconColor = 'blue';
            } else if (lowerTitle.includes('chair') || lowerTitle.includes('furniture') || lowerTitle.includes('desk')) {
              iconType = 'chair';
              iconColor = 'green';
            }

            return {
              id: t.id.toString(),
              tag: t.assets?.tag || 'AF-0012',
              title: t.issue_details,
              desc: t.technician ? `Tech: ${t.technician}` : '',
              column: t.status.toLowerCase(), // 'pending', 'approved', 'technician', 'in-progress', 'resolved'
              dateText: `Created on ${new Date(t.created_at).toLocaleDateString()}`,
              iconType,
              iconColor,
              priority: t.priority || 'MEDIUM'
            };
          }));
        }
      } catch (err) {
        console.error('Failed to load maintenance tasks:', err);
      }
    };
    fetchMaintenanceTasks();
  }, [assets]);

  // 2. Drag & Drop Visual State
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  // 3. Modal Form UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetColumn, setTargetColumn] = useState('pending');
  const [taskForm, setTaskForm] = useState({
    tag: '',
    title: '',
    desc: ''
  });

  // 4. AI Advisor UI State (Phase 1)
  const [selectedTaskForAI, setSelectedTaskForAI] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Kanban Columns Configuration
  const COLUMNS = [
    { id: 'pending', title: 'Pending', count: tasks.filter(t => t.column === 'pending').length, icon: ClockIcon, colorClass: 'text-orange-500' },
    { id: 'approved', title: 'Approved', count: tasks.filter(t => t.column === 'approved').length, icon: CheckCircleIcon, colorClass: 'text-success-green-text' },
    { id: 'technician', title: 'Technician Assigned', count: tasks.filter(t => t.column === 'technician').length, icon: UserIcon, colorClass: 'text-blue-500' },
    { id: 'in-progress', title: 'In Progress', count: tasks.filter(t => t.column === 'in-progress').length, icon: SettingsIcon, colorClass: 'text-purple-500' },
    { id: 'resolved', title: 'Resolved', count: tasks.filter(t => t.column === 'resolved').length, icon: CheckCircleIcon, colorClass: 'text-success-green-text' }
  ];

  // Helper to retrieve correct icon component based on type
  const getCardIcon = (iconType) => {
    switch (iconType) {
      case 'bulb': return BulbIcon;
      case 'ac': return AcUnitIcon;
      case 'printer': return PrinterIcon;
      case 'wrench': return WrenchIcon;
      case 'chair': return ChairIcon;
      default: return BoxIcon;
    }
  };

  const getCardIconColors = (color) => {
    switch (color) {
      case 'orange': return 'bg-[#FFF4EF] text-[#FF5A1F]';
      case 'green': return 'bg-[#ECFDF5] text-[#10B981]';
      case 'blue': return 'bg-[#EFF6FF] text-[#3B82F6]';
      case 'purple': return 'bg-[#F5F3FF] text-[#8A5CF5]';
      default: return 'bg-bg-gray text-text-secondary';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch ((priority || '').toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  // Sync Asset Status when a maintenance task is modified
  const syncAssetStatus = (tag, columnId) => {
    if (!setAssets || !assets.length) return;

    let newStatus = 'Available';
    if (['approved', 'technician', 'in-progress'].includes(columnId)) {
      newStatus = 'Maintenance';
    } else if (columnId === 'resolved') {
      newStatus = 'Available';
    }

    setAssets(
      assets.map((a) => {
        if (a.tag.toUpperCase() === tag.toUpperCase()) {
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  // HTML5 DRAG AND DROP HANDLERS
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e, targetColId) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const today = '7 Jul 2026';
    let dateText = `Reported on ${today}`;
    if (targetColId === 'approved') dateText = `Approved on ${today}`;
    else if (targetColId === 'technician') dateText = `Assigned on ${today}`;
    else if (targetColId === 'in-progress') dateText = `Started on ${today}`;
    else if (targetColId === 'resolved') dateText = `Resolved on ${today}`;

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: targetColId.toUpperCase() })
        .eq('id', taskId);

      if (error) {
        return alert('Failed to update status in database: ' + error.message);
      }

      let newAssetStatus = 'AVAILABLE';
      if (['approved', 'technician', 'in-progress'].includes(targetColId)) {
        newAssetStatus = 'UNDER_MAINTENANCE';
      } else if (targetColId === 'resolved') {
        newAssetStatus = 'AVAILABLE';
      }

      const asset = assets.find(a => a.tag.toUpperCase() === task.tag.toUpperCase());
      if (asset) {
        await supabase
          .from('assets')
          .update({ status: newAssetStatus })
          .eq('tag', task.tag.toUpperCase());
      }

      setTasks(
        tasks.map(t => t.id === taskId ? { ...t, column: targetColId, dateText } : t)
      );

      syncAssetStatus(task.tag, targetColId);
    } catch (err) {
      console.error('Error dropping task:', err);
    }
  };

  // Open create task Modal
  const openAddTaskModal = (colId) => {
    setTargetColumn(colId);
    setTaskForm({
      tag: assets[0]?.tag || '',
      title: '',
      desc: ''
    });
    setShowAddModal(true);
  };

  // Submit new task handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { tag, title, desc } = taskForm;
    if (!tag || !title) return alert('Please fill in Asset Tag and Issue title.');

    const lowerTitle = title.toLowerCase();
    let iconType = 'box';
    let iconColor = 'orange';

    if (lowerTitle.includes('bulb') || lowerTitle.includes('light') || lowerTitle.includes('projector')) {
      iconType = 'bulb';
      iconColor = 'orange';
    } else if (lowerTitle.includes('ac') || lowerTitle.includes('compressor') || lowerTitle.includes('cooling')) {
      iconType = 'ac';
      iconColor = 'green';
    } else if (lowerTitle.includes('print') || lowerTitle.includes('paper') || lowerTitle.includes('jam')) {
      iconType = 'printer';
      iconColor = 'purple';
    } else if (lowerTitle.includes('wrench') || lowerTitle.includes('tool') || lowerTitle.includes('forklift') || lowerTitle.includes('engine')) {
      iconType = 'wrench';
      iconColor = 'blue';
    } else if (lowerTitle.includes('chair') || lowerTitle.includes('furniture') || lowerTitle.includes('desk')) {
      iconType = 'chair';
      iconColor = 'green';
    }

    const today = '7 Jul 2026';
    let dateText = `Reported on ${today}`;
    if (targetColumn === 'approved') dateText = `Approved on ${today}`;
    else if (targetColumn === 'technician') dateText = `Assigned on ${today}`;
    else if (targetColumn === 'in-progress') dateText = `Started on ${today}`;
    else if (targetColumn === 'resolved') dateText = `Resolved on ${today}`;

    try {
      const asset = assets.find(a => a.tag.toUpperCase() === tag.toUpperCase());
      const assetId = asset ? asset.id : 1;

      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([
          {
            asset_id: assetId,
            reporter_id: 1,
            issue_details: title,
            priority: 'MEDIUM',
            status: targetColumn.toUpperCase(),
            technician: desc || null
          }
        ])
        .select();

      if (error) {
        return alert('Failed to create maintenance request: ' + error.message);
      }

      if (data && data[0]) {
        const newTask = {
          id: data[0].id.toString(),
          tag: tag.toUpperCase(),
          title,
          desc,
          column: targetColumn,
          dateText,
          iconType,
          iconColor,
          priority: 'MEDIUM'
        };

        setTasks([...tasks, newTask]);
        setShowAddModal(false);
        syncAssetStatus(tag, targetColumn);
      }
    } catch (err) {
      console.error('Error submitting maintenance task:', err);
    }
  };

  // Phase 1: Open AI Insight Panel & Trigger Analysis
  const handleOpenAIInsight = async (task, e) => {
    if (e) e.stopPropagation();
    setSelectedTaskForAI(task);
    setAiLoading(true);
    setAiInsight(null);

    const asset = assets.find(a => a.tag.toUpperCase() === task.tag.toUpperCase());
    const assetId = asset ? asset.id : null;

    const result = await aiService.getMaintenanceInsight({
      assetId,
      issueDescription: task.title,
      requestId: task.id
    });

    setAiInsight(result);
    setAiLoading(false);
  };

  // Phase 1: Apply AI Recommended Priority to Request
  const handleApplyPriority = async (priority) => {
    if (!selectedTaskForAI || !priority) return;
    try {
      await supabase
        .from('maintenance_requests')
        .update({ priority: priority.toUpperCase() })
        .eq('id', selectedTaskForAI.id);

      setTasks(tasks.map(t => t.id === selectedTaskForAI.id ? { ...t, priority: priority.toUpperCase() } : t));
      alert(`Applied recommended priority [${priority.toUpperCase()}] to ${selectedTaskForAI.tag}!`);
    } catch (err) {
      console.error('Failed to apply recommended priority:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sub-header text */}
      <div className="mt-[-16px]">
        <span className="text-xs font-semibold text-text-secondary select-none">
          Approval workflow board with AI Diagnostic Advisor
        </span>
      </div>

      {/* 1. Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`w-full flex flex-col gap-3 bg-bg-gray border border-border-color border-dashed p-3 rounded-2xl min-h-[350px] transition-colors duration-200 ${
              draggedOverCol === col.id ? 'bg-primary-orange-light/30 border-primary-orange-border/30' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-primary uppercase tracking-wider">
                <span className={`shrink-0 flex items-center justify-center ${col.colorClass}`}>
                  <col.icon size={13} />
                </span>
                {col.title}
              </div>
              <div className="bg-white border border-border-color text-text-secondary text-[9px] font-extrabold rounded-full px-2 py-0.5 shadow-sm">
                {col.count}
              </div>
            </div>

            {/* List of cards in this column */}
            <div className="flex flex-col gap-2.5">
              {tasks
                .filter((t) => t.column === col.id)
                .map((task) => {
                  const CardIcon = getCardIcon(task.iconType);
                  return (
                    <div
                      key={task.id}
                      className="bg-white border border-border-color rounded-xl p-4 shadow-xs flex flex-col gap-2.5 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all duration-200 group relative"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      {/* Card Header (Icon, Tag name, Priority Badge) */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getCardIconColors(task.iconColor)}`}>
                            <CardIcon size={16} />
                          </div>
                          <span className="text-[11px] font-extrabold text-text-primary tracking-tight">{task.tag}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority || 'MEDIUM'}
                        </span>
                      </div>

                      {/* Card Content (Title & Desc) */}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-[11px] font-bold text-text-primary leading-snug">{task.title}</h4>
                        {task.desc && <p className="text-[10px] font-semibold text-text-secondary mt-0.5">{task.desc}</p>}
                      </div>

                      {/* Date reported & AI Action Button */}
                      <div className="flex items-center justify-between text-[9px] font-bold text-text-secondary mt-1 border-t border-border-color pt-2 select-none">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon size={12} className="text-text-secondary" />
                          <span>{task.dateText}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleOpenAIInsight(task, e)}
                          className="flex items-center gap-1 bg-primary-orange-light/90 hover:bg-primary-orange text-primary-orange hover:text-white border border-primary-orange/20 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-sm"
                          title="Run AI Diagnostic & Priority Check"
                        >
                          <span>🤖</span>
                          <span>AI Insights</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Add Task placeholder button inside column — all roles can raise a request */}
            <button
              className="w-full bg-white border border-border-color border-dashed hover:border-primary-orange text-text-secondary hover:text-primary-orange text-[10px] font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 mt-1"
              onClick={() => openAddTaskModal(col.id)}
            >
              + Add Task
            </button>
            {/* Approve hint: shown on the 'approved' column for non-asset-managers */}
            {col.id === 'approved' && !canApproveMaintenance && (
              <div className="text-[9px] font-semibold text-text-muted text-center mt-0.5 flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Asset Managers only
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 2. Alert Warning Disclaimer Banner */}
      <div className="bg-primary-orange-light border border-primary-orange-border/20 rounded-2xl p-4 flex justify-between items-center flex-wrap gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="text-primary-orange flex items-center shrink-0">
            <InfoIcon size={20} strokeWidth={2.4} />
          </div>
          <p className="text-xs font-semibold text-primary-orange leading-relaxed m-0">
            Approving a card moves the asset to under maintenance, resolving return it to available. Click <strong className="font-extrabold">🤖 AI Insights</strong> on any card for root-cause diagnosis.
          </p>
        </div>
      </div>

      {/* 3. Kanban Add Task Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form className="bg-white border border-border-color rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col gap-5 p-6" onSubmit={handleFormSubmit}>
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <h3 className="font-heading text-base font-extrabold text-text-primary">
                Add Task to Column: <span className="text-primary-orange">{targetColumn.toUpperCase()}</span>
              </h3>
              <button 
                type="button" 
                className="text-text-secondary hover:text-text-primary text-xl font-bold transition cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Asset (Tag / Serial)</label>
              <select
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium cursor-pointer"
                value={taskForm.tag}
                onChange={(e) => setTaskForm({ ...taskForm, tag: e.target.value })}
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.tag}>
                    {asset.tag} - {asset.name} ({asset.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Issue / Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AC unit noisy compressor, Printer Jam"
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Details / Technician Name</label>
              <input
                type="text"
                placeholder="e.g. Tech: R Varma, parts ordered"
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={taskForm.desc}
                onChange={(e) => setTaskForm({ ...taskForm, desc: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-color mt-2">
              <button 
                type="button" 
                className="border border-border-color bg-white hover:bg-bg-gray text-text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl transition cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer">
                Create Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Phase 1 AI Maintenance Advisor Slide-in / Modal Panel */}
      {selectedTaskForAI && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-end z-50 animate-fadeIn">
          <div className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col border-l border-border-color overflow-y-auto animate-slideLeft">
            
            {/* Panel Header */}
            <div className="p-6 border-b border-border-color bg-[#FFFDFB] sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-orange-light text-primary-orange flex items-center justify-center text-lg font-bold shadow-xs">
                  🤖
                </div>
                <div>
                  <h3 className="font-heading text-base font-extrabold text-text-primary leading-tight">
                    AI Maintenance Advisor
                  </h3>
                  <p className="text-xs font-semibold text-text-secondary mt-0.5">
                    Diagnostic Report for <span className="font-extrabold text-text-primary">{selectedTaskForAI.tag}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForAI(null)}
                className="w-8 h-8 rounded-lg bg-bg-gray hover:bg-gray-200 text-text-secondary hover:text-text-primary flex items-center justify-center text-lg font-bold transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-6 flex-1 flex flex-col gap-6">
              {/* Reported Symptom Card */}
              <div className="bg-bg-gray border border-border-color rounded-xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Reported Symptom / Task</span>
                <p className="text-sm font-bold text-text-primary leading-snug">{selectedTaskForAI.title}</p>
                {selectedTaskForAI.desc && <p className="text-xs text-text-secondary font-semibold">{selectedTaskForAI.desc}</p>}
              </div>

              {/* Loading State Spinner */}
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-10 h-10 border-3 border-primary-orange border-t-transparent rounded-full animate-spin"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-extrabold text-text-primary">Analyzing Asset Diagnostic History...</span>
                    <span className="text-xs font-semibold text-text-secondary">Consulting engineering models and wear patterns</span>
                  </div>
                </div>
              ) : aiInsight ? (
                <div className="flex flex-col gap-5">
                  
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-success-green-text bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-success-green/20">
                      {aiInsight.isCached ? "⚡ Loaded from DB Cache" : "✨ Live AI Diagnostic Report"}
                    </span>
                    {aiInsight.isFallback && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Local Fallback Engine
                      </span>
                    )}
                  </div>

                  {/* Likely Root Cause */}
                  <div className="bg-white border border-border-color rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary-orange">
                      <span className="text-base">🔍</span>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Likely Root Cause</h4>
                    </div>
                    <p className="text-xs font-semibold text-text-secondary leading-relaxed">
                      {aiInsight.rootCauseSuggestion}
                    </p>
                  </div>

                  {/* Priority Recommendation Box */}
                  <div className="bg-[#FFF8F5] border border-[#FFE0D1] rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚠️</span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Recommended Priority</h4>
                      </div>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border shadow-2xs ${getPriorityBadgeColor(aiInsight.priorityRecommendation)}`}>
                        {aiInsight.priorityRecommendation || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-text-secondary italic">
                      "{aiInsight.priorityRationale}"
                    </p>

                    {/* Apply Priority Action Button */}
                    <button
                      type="button"
                      onClick={() => handleApplyPriority(aiInsight.priorityRecommendation)}
                      className="w-full mt-1 bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply Recommended Priority ({aiInsight.priorityRecommendation})</span>
                    </button>
                  </div>

                  {/* Preventive Tips List */}
                  <div className="bg-white border border-border-color rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <span className="text-base">💡</span>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Preventive Action Tips</h4>
                    </div>
                    <ul className="flex flex-col gap-2.5 pl-1">
                      {(aiInsight.preventiveTips || []).map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-text-secondary leading-normal">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary text-xs font-semibold">
                  No diagnostic data available.
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-border-color bg-bg-gray sticky bottom-0 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTaskForAI(null)}
                className="bg-white border border-border-color hover:bg-gray-100 text-text-primary text-xs font-extrabold px-6 py-2.5 rounded-xl transition cursor-pointer"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
