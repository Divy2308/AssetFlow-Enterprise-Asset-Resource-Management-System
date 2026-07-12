import React, { useState } from 'react';
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

export default function MaintenancePage({ assets = [], setAssets }) {
  // 1. Initial State for Kanban Tasks (matching mockup)
  const [tasks, setTasks] = useState([
    { id: '1', tag: 'AF-0062', title: 'Projector bulb not turning on', desc: '', column: 'pending', dateText: 'Reported on 7 Jul 2026', iconType: 'bulb', iconColor: 'orange' },
    { id: '2', tag: 'AF-003', title: 'AC unit', desc: 'noisy compressor', column: 'approved', dateText: 'Approved on 7 Jul 2026', iconType: 'ac', iconColor: 'green' },
    { id: '3', tag: 'AF-0078', title: 'Forklift', desc: 'Tech: R Varma', column: 'technician', dateText: 'Assigned on 7 Jul 2026', iconType: 'wrench', iconColor: 'blue' },
    { id: '4', tag: 'AF-897', title: 'Printer Jam', desc: 'parts ordered', column: 'in-progress', dateText: 'Started on 7 Jul 2026', iconType: 'printer', iconColor: 'purple' },
    { id: '5', tag: 'AF-873', title: 'Chair repair resolved', desc: '', column: 'resolved', dateText: 'Resolved on 7 Jul 2026', iconType: 'chair', iconColor: 'green' }
  ]);

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

  // Sync Asset Status when a maintenance task is modified
  const syncAssetStatus = (tag, columnId) => {
    if (!setAssets || !assets.length) return;

    // Check target column and determine new status
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

  // ----------------------------------------------------
  // HTML5 DRAG AND DROP HANDLERS
  // ----------------------------------------------------
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

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine the reported text header
    const today = '7 Jul 2026';
    let dateText = `Reported on ${today}`;
    if (targetColId === 'approved') dateText = `Approved on ${today}`;
    else if (targetColId === 'technician') dateText = `Assigned on ${today}`;
    else if (targetColId === 'in-progress') dateText = `Started on ${today}`;
    else if (targetColId === 'resolved') dateText = `Resolved on ${today}`;

    // Update tasks in state
    setTasks(
      tasks.map(t => t.id === taskId ? { ...t, column: targetColId, dateText } : t)
    );

    // Synchronize asset status
    syncAssetStatus(task.tag, targetColId);
  };

  // Click handler to open create task Modal
  const openAddTaskModal = (colId) => {
    setTargetColumn(colId);
    // Find first asset as default tag input
    setTaskForm({
      tag: assets[0]?.tag || '',
      title: '',
      desc: ''
    });
    setShowAddModal(true);
  };

  // Submit new task handler
  const handleFormSubmit = (e) => {
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

    const newTask = {
      id: Date.now().toString(),
      tag: tag.toUpperCase(),
      title,
      desc,
      column: targetColumn,
      dateText,
      iconType,
      iconColor
    };

    setTasks([...tasks, newTask]);
    setShowAddModal(false);

    // Sync Asset Status
    syncAssetStatus(tag, targetColumn);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sub-header text (handled below the main title split) */}
      <div className="mt-[-16px]">
        <span className="text-xs font-semibold text-text-secondary select-none">
          Approval workflow board
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
                      className="bg-white border border-border-color rounded-xl p-4 shadow-xs flex flex-col gap-2.5 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all duration-200"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      {/* Card Header (Icon & Tag name) */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getCardIconColors(task.iconColor)}`}>
                          <CardIcon size={16} />
                        </div>
                        <span className="text-[11px] font-extrabold text-text-primary tracking-tight">{task.tag}</span>
                      </div>

                      {/* Card Content (Title & Desc) */}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-[11px] font-bold text-text-primary leading-snug">{task.title}</h4>
                        {task.desc && <p className="text-[10px] font-semibold text-text-secondary mt-0.5">{task.desc}</p>}
                      </div>

                      {/* Date reported */}
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-secondary mt-1 border-t border-border-color pt-2 select-none">
                        <CalendarIcon size={12} className="text-text-secondary" />
                        <span>{task.dateText}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Add Task placeholder button inside column */}
            <button
              className="w-full bg-white border border-border-color border-dashed hover:border-primary-orange text-text-secondary hover:text-primary-orange text-[10px] font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 mt-1"
              onClick={() => openAddTaskModal(col.id)}
            >
              + Add Task
            </button>
          </div>
        ))}
      </div>

      {/* 2. Alert Warning Disclaimer Banner with clipboard graphics */}
      <div className="bg-primary-orange-light border border-primary-orange-border/20 rounded-2xl p-4 flex justify-between items-center flex-wrap gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="text-primary-orange flex items-center shrink-0">
            <InfoIcon size={20} strokeWidth={2.4} />
          </div>
          <p className="text-xs font-semibold text-primary-orange leading-relaxed m-0">
            Approving a card moves the asset to under maintenance, resolving return it to available.
          </p>
        </div>
        
        {/* Sleek inline checklist vector decorator */}
        <div className="flex items-center gap-3 opacity-70 mr-2 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary-orange)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary-orange)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
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

            {/* Select Tag from existing Assets */}
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

            {/* Issue Title Input */}
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

            {/* Description Subtext Input */}
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

    </div>
  );
}
