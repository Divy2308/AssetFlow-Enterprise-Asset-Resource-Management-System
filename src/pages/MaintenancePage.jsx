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
    { id: 'pending', title: 'Pending', count: tasks.filter(t => t.column === 'pending').length, icon: ClockIcon },
    { id: 'approved', title: 'Approved', count: tasks.filter(t => t.column === 'approved').length, icon: CheckCircleIcon },
    { id: 'technician', title: 'Technician Assigned', count: tasks.filter(t => t.column === 'technician').length, icon: UserIcon },
    { id: 'in-progress', title: 'In Progress', count: tasks.filter(t => t.column === 'in-progress').length, icon: SettingsIcon },
    { id: 'resolved', title: 'Resolved', count: tasks.filter(t => t.column === 'resolved').length, icon: CheckCircleIcon }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dynamic Sub-header Info */}
      <div style={{ marginTop: '-8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Approval workflow board
        </span>
      </div>

      {/* 1. Kanban Board Grid */}
      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`kanban-column ${col.id} ${draggedOverCol === col.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="kanban-column-header">
              <div className="column-title">
                <span className="column-title-icon">
                  <col.icon size={14} />
                </span>
                {col.title}
              </div>
              <div className="column-count">{col.count}</div>
            </div>

            {/* List of cards in this column */}
            {tasks
              .filter((t) => t.column === col.id)
              .map((task) => {
                const CardIcon = getCardIcon(task.iconType);
                return (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    {/* Card Header (Icon & Tag name) */}
                    <div className="kanban-card-header">
                      <div className={`card-icon-box ${task.iconColor}`}>
                        <CardIcon size={16} />
                      </div>
                      <span className="kanban-card-tag">{task.tag}</span>
                    </div>

                    {/* Card Content (Title & Desc) */}
                    <div className="kanban-card-content">
                      <h4 className="kanban-card-title">{task.title}</h4>
                      {task.desc && <p className="kanban-card-desc">{task.desc}</p>}
                    </div>

                    {/* Date reported */}
                    <div className="kanban-card-date">
                      <CalendarIcon size={12} className="calendar-icon" />
                      <span>{task.dateText}</span>
                    </div>
                  </div>
                );
              })}

            {/* Add Task placeholder button inside column */}
            <button
              className={`btn-add-task ${col.id}`}
              onClick={() => openAddTaskModal(col.id)}
            >
              + Add Task
            </button>
          </div>
        ))}
      </div>

      {/* 2. Alert Warning Disclaimer Banner with clipboard graphics */}
      <div 
        className="info-banner" 
        style={{ 
          marginTop: '8px', 
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, var(--primary-orange-light) 0%, #FFF9F6 100%)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="info-banner-icon">
            <InfoIcon size={20} strokeWidth={2.4} />
          </div>
          <p className="info-banner-text">
            Approving a card moves the asset to under maintenance, resolving return it to available.
          </p>
        </div>
        
        {/* Sleek inline checklist vector decorator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.8, marginRight: '10px' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
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
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary-orange)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.6 }}
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </div>

      {/* 3. Kanban Add Task Modal Overlay */}
      {showAddModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleFormSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">
                Add Task to Column: <span style={{ color: 'var(--primary-orange)' }}>{targetColumn.toUpperCase()}</span>
              </h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {/* Select Tag from existing Assets */}
            <div className="form-group">
              <label className="form-label">Select Asset (Tag / Serial)</label>
              <select
                className="form-select"
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
            <div className="form-group">
              <label className="form-label">Issue / Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AC unit noisy compressor, Printer Jam"
                className="form-input"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>

            {/* Description Subtext Input */}
            <div className="form-group">
              <label className="form-label">Details / Technician Name</label>
              <input
                type="text"
                placeholder="e.g. Tech: R Varma, parts ordered"
                className="form-input"
                value={taskForm.desc}
                onChange={(e) => setTaskForm({ ...taskForm, desc: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Create Card
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
