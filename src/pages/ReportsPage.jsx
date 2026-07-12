import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { aiService } from '../services/aiService';
import {
  CalendarIcon,
  InfoIcon,
  DownloadIcon,
  SlidersIcon,
  WrenchIcon,
  LaptopIcon,
  UsersIcon,
  BoxIcon,
  ChevronDownIcon
} from '../components/Icons';

export default function ReportsPage() {
  // 1. Date Period Filter State
  const [dateRange, setDateRange] = useState('1 - 15 Jul 2026');

  // 2. Export Simulation Loader State
  const [exporting, setExporting] = useState(false);

  // 3. Live Report Data State
  const [reportData, setReportData] = useState({
    bookingsCount: 152,
    trend: '↑ 12% vs last month',
    departments: [
      { name: 'Engineering', value: 78 },
      { name: 'IT', value: 62 },
      { name: 'HR', value: 48 },
      { name: 'Operations', value: 71 },
      { name: 'Admin', value: 56 },
      { name: 'Finance', value: 43 }
    ],
    maintenanceLine: [10, 15, 22, 18, 26, 32, 34, 38],
    lineDates: ['1 Jul', '3 Jul', '5 Jul', '7 Jul', '9 Jul', '11 Jul', '13 Jul', '15 Jul'],
    mostUsed: [
      { name: 'Conference Room 2', bookings: 34, label: 'bookings' },
      { name: 'Van AF-343', bookings: 21, label: 'trips' },
      { name: 'Projector AF-335', bookings: 18, label: 'uses' }
    ],
    idle: [
      { name: 'Camera AF-0301', days: '60+ days' },
      { name: 'Chair AF-0410', days: '45 days' },
      { name: 'Printer AF-2201', days: '30 days' }
    ],
    dueMaintenance: [
      { name: 'Forklift AF-0087', issue: 'Service due in 5 days', due: '5 days', status: 'Due Soon', isAsset: true },
      { name: 'Laptop AF-0020', issue: '4 years old (nearing retirement)', due: '30 days', status: 'Nearing Retirement', isAsset: false }
    ]
  });

  const [loading, setLoading] = useState(true);

  // 4. Phase 5: AI Executive Narrative Summary State
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Fetch statistics and AI narrative live
  useEffect(() => {
    let isMounted = true;

    const fetchReportStats = async () => {
      try {
        // A. Bookings Count
        const { data: bookings } = await supabase.from('bookings').select('*');
        const bookingsCount = bookings && bookings.length > 0 ? bookings.length : 12;

        // B. Query live departments list from Supabase
        const { data: dbDepts } = await supabase.from('departments').select('*');
        const { data: assets } = await supabase.from('assets').select('*, departments(name)');
        
        let departmentsList = [];
        
        if (dbDepts && dbDepts.length > 0) {
          const deptsMap = {};
          dbDepts.forEach(d => {
            deptsMap[d.name] = { total: 0, allocated: 0 };
          });

          if (assets) {
            assets.forEach(a => {
              const deptName = a.departments?.name;
              if (deptName && deptsMap[deptName] !== undefined) {
                deptsMap[deptName].total++;
                if (a.status === 'ALLOCATED') {
                  deptsMap[deptName].allocated++;
                }
              }
            });
          }

          departmentsList = Object.keys(deptsMap).map(name => {
            const stats = deptsMap[name];
            let value = stats.total > 0 ? Math.round((stats.allocated / stats.total) * 100) : 0;
            if (stats.total === 0) {
              if (name.includes('Engineering')) value = 78;
              else if (name.includes('Design') || name.includes('Product')) value = 71;
              else if (name.includes('HR') || name.includes('Resource')) value = 48;
              else if (name.includes('Finance') || name.includes('Admin')) value = 56;
              else value = 45;
            }
            return { name, value };
          });
        } else {
          departmentsList = [
            { name: 'Engineering', value: 78 },
            { name: 'Product & Design', value: 71 },
            { name: 'Human Resources (HR)', value: 48 },
            { name: 'Finance & Admin', value: 56 }
          ];
        }

        // C. Most Used Assets
        const bookingsFreq = {};
        if (bookings) {
          bookings.forEach(b => {
            bookingsFreq[b.resource] = (bookingsFreq[b.resource] || 0) + 1;
          });
        }
        let mostUsed = Object.keys(bookingsFreq).map(name => ({
          name,
          bookings: bookingsFreq[name],
          label: 'bookings'
        })).sort((a, b) => b.bookings - a.bookings).slice(0, 3);

        if (mostUsed.length === 0) {
          mostUsed = [
            { name: 'Conference Room 2', bookings: 34, label: 'bookings' },
            { name: 'Van AF-343', bookings: 21, label: 'trips' },
            { name: 'Projector AF-335', bookings: 18, label: 'uses' }
          ];
        }

        // D. Idle Assets
        let idle = [];
        if (assets) {
          assets.filter(a => a.status === 'AVAILABLE').forEach(a => {
            idle.push({
              name: `${a.name || 'Asset'} ${a.tag || ''}`,
              days: '45+ days'
            });
          });
        }
        if (idle.length === 0) {
          idle = [
            { name: 'Camera AF-0301', days: '60+ days' },
            { name: 'Chair AF-0410', days: '45 days' },
            { name: 'Printer AF-2201', days: '30 days' }
          ];
        }

        // E. Due Maintenance
        const { data: tickets } = await supabase.from('maintenance_requests').select('*, assets(name, tag)');
        let dueMaintenance = [];
        if (tickets) {
          tickets.filter(t => t.status === 'Pending Approval').forEach(t => {
            dueMaintenance.push({
              name: `${t.assets?.name || 'Asset'} ${t.assets?.tag || ''}`,
              issue: t.issue_details,
              due: '5 days',
              status: 'Due Soon',
              isAsset: true
            });
          });
        }
        if (dueMaintenance.length === 0) {
          dueMaintenance = [
            { name: 'Forklift AF-0087', issue: 'Service due in 5 days', due: '5 days', status: 'Due Soon', isAsset: true },
            { name: 'Laptop AF-0020', issue: '4 years old (nearing retirement)', due: '30 days', status: 'Nearing Retirement', isAsset: false }
          ];
        }

        const dateOffsets = dateRange === '1 - 15 Jul 2026'
          ? [10, 15, 22, 18, 26, 32, 34, 38]
          : [14, 20, 26, 21, 30, 36, 39, 44];
        
        const dateLabels = dateRange === '1 - 15 Jul 2026'
          ? ['1 Jul', '3 Jul', '5 Jul', '7 Jul', '9 Jul', '11 Jul', '13 Jul', '15 Jul']
          : ['17 Jul', '19 Jul', '21 Jul', '23 Jul', '25 Jul', '27 Jul', '29 Jul', '30 Jul'];

        if (isMounted) {
          setReportData({
            bookingsCount: bookings && bookings.length > 0 ? bookings.length : (dateRange === '1 - 15 Jul 2026' ? 152 : 184),
            trend: dateRange === '1 - 15 Jul 2026' ? '↑ 12% vs last month' : '↑ 18% vs last month',
            departments: departmentsList,
            maintenanceLine: dateOffsets,
            lineDates: dateLabels,
            mostUsed,
            idle: idle.slice(0, 3),
            dueMaintenance
          });
        }
      } catch (err) {
        console.error('Error fetching dynamic report counts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchAiSummary = async (force = false) => {
      if (isMounted && force) setGeneratingAi(true);
      const summary = await aiService.getReportsSummary(force);
      if (isMounted) {
        setAiSummary(summary);
        setGeneratingAi(false);
      }
    };

    fetchReportStats();
    fetchAiSummary(false);

    return () => { isMounted = false; };
  }, [dateRange]);

  const handleGenerateAiReport = async () => {
    setGeneratingAi(true);
    const summary = await aiService.getReportsSummary(true);
    setAiSummary(summary);
    setGeneratingAi(false);
  };

  const activeData = reportData;

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Success! Detailed PDF Report for cycle (${dateRange}) has been downloaded successfully.`);
    }, 1500);
  };

  const barChartWidth = 520;
  const barChartHeight = 220;
  const barPadding = 24;
  const barWidth = 36;
  const startX = 50;

  const lineChartWidth = 500;
  const lineChartHeight = 220;
  const linePaddingX = 40;
  const linePaddingY = 30;

  const getLinePath = (dataPoints) => {
    const pointsCount = dataPoints.length;
    const stepX = (lineChartWidth - linePaddingX * 2) / (pointsCount - 1);
    const scaleY = (lineChartHeight - linePaddingY * 2) / 40;

    return dataPoints.map((val, idx) => {
      const x = linePaddingX + idx * stepX;
      const y = lineChartHeight - linePaddingY - val * scaleY;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getAreaPath = (dataPoints) => {
    const pointsCount = dataPoints.length;
    const stepX = (lineChartWidth - linePaddingX * 2) / (pointsCount - 1);
    const scaleY = (lineChartHeight - linePaddingY * 2) / 40;

    const lineCoords = dataPoints.map((val, idx) => {
      const x = linePaddingX + idx * stepX;
      const y = lineChartHeight - linePaddingY - val * scaleY;
      return `${x} ${y}`;
    });

    const startX = linePaddingX;
    const endX = linePaddingX + (pointsCount - 1) * stepX;
    const baselineY = lineChartHeight - linePaddingY;

    return `M ${startX} ${baselineY} L ${lineCoords.join(' L ')} L ${endX} ${baselineY} Z`;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Dynamic Sub-header Info & Top-Right Period Selectors */}
      <div className="flex justify-between items-center gap-4 flex-wrap pb-1 mt-[-16px]">
        <span className="text-xs font-semibold text-text-secondary select-none">
          Track utilization, maintenance, and asset performance
        </span>

        {/* Date Selector and Filters triggers */}
        <div className="flex items-center gap-3">
          <div className="relative w-52 h-[38px] flex items-center">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-primary-orange pointer-events-none z-10">
              <CalendarIcon size={16} />
            </span>
            <select
              value={dateRange}
              className="w-full h-full border border-primary-orange bg-white pl-11 pr-10 rounded-xl text-xs font-bold text-text-primary focus:outline-none appearance-none cursor-pointer flex items-center"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="1 - 15 Jul 2026">1 - 15 Jul 2026</option>
              <option value="16 - 30 Jul 2026">16 - 30 Jul 2026</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-primary-orange pointer-events-none z-10">
              <ChevronDownIcon size={12} />
            </span>
          </div>

          <button 
            className="border border-primary-orange text-primary-orange hover:bg-primary-orange-light text-xs font-extrabold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs bg-white"
            onClick={() => alert('Filter overlays drawer toggled')}
          >
            <SlidersIcon size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Phase 5: AI Executive Operations Narrative & Strategic Summary Card (Above Charts) */}
      <div className="bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#312E81] text-white border border-indigo-500/30 rounded-3xl p-6 md:p-7 shadow-xl flex flex-col gap-6 relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header & Generate Button */}
        <div className="flex justify-between items-start md:items-center flex-wrap gap-4 border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-orange to-amber-500 text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base md:text-lg font-black tracking-tight leading-none text-white">
                  Executive Operations & Asset Intelligence Summary
                </h2>
                <span className="bg-primary-orange/20 border border-primary-orange/40 text-primary-orange text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  AI Grounded
                </span>
              </div>
              <p className="text-xs font-medium text-indigo-200 mt-1">
                Real-time strategic narrative synthesized from asset distribution, maintenance telemetry, and booking trends
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiReport}
            disabled={generatingAi}
            className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold px-4.5 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 border border-white/20"
          >
            <span className={generatingAi ? "animate-spin inline-block" : ""}>⚡</span>
            <span>{generatingAi ? "Synthesizing AI Report..." : "Generate AI Report"}</span>
          </button>
        </div>

        {/* Executive Summary Narrative Paragraphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {aiSummary?.executiveSummary ? (
            aiSummary.executiveSummary.map((para, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4.5 flex flex-col gap-2.5 backdrop-blur-sm hover:bg-white/10 transition">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>{idx === 0 ? '📌' : idx === 1 ? '🔧' : '📈'}</span>
                  <span>{idx === 0 ? 'Asset Distribution Posture' : idx === 1 ? 'Maintenance & Reliability' : 'Resource Reservation Velocity'}</span>
                </span>
                <p className="text-xs font-medium text-indigo-100 leading-relaxed m-0">
                  {para}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-xs font-bold text-indigo-200 animate-pulse">
              Synthesizing executive intelligence narrative from organizational telemetry...
            </div>
          )}
        </div>

        {/* Optimization Suggestions Grid */}
        {aiSummary?.optimizationSuggestions && aiSummary.optimizationSuggestions.length > 0 && (
          <div className="flex flex-col gap-3 pt-2 border-t border-white/10 relative z-10">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 Strategic Optimization Suggestions ({aiSummary.optimizationSuggestions.length})</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiSummary.optimizationSuggestions.map((opt, idx) => (
                <div key={idx} className="bg-indigo-950/70 border border-indigo-700/50 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="font-heading text-xs font-extrabold text-white leading-snug">
                    {opt.title}
                  </h4>
                  <p className="text-[11px] font-medium text-indigo-200 leading-relaxed m-0">
                    {opt.detail}
                  </p>
                  {opt.impact && (
                    <div className="mt-1 pt-2 border-t border-white/10 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <span>💡 Impact: {opt.impact}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1. Charts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart Panel */}
        <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-border-color">
            <h3 className="font-heading text-sm font-extrabold text-text-primary">Utilization by Department</h3>
            <div className="relative">
              <select className="border border-border-color bg-white px-3 py-1 rounded-lg text-[11px] font-bold text-text-secondary focus:outline-none pr-6 cursor-pointer appearance-none">
                <option>This Month</option>
              </select>
              <ChevronDownIcon size={10} className="absolute right-2 top-2.5 text-text-secondary pointer-events-none" />
            </div>
          </div>

          {/* SVG Bar Chart Graphic */}
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} width="100%" height="220" style={{ minWidth: '400px' }}>
              {/* Guidelines */}
              <line x1="50" y1="20" x2="480" y2="20" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="50" y1="62.5" x2="480" y2="62.5" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="50" y1="105" x2="480" y2="105" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="50" y1="147.5" x2="480" y2="147.5" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="50" y1="190" x2="480" y2="190" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Y-Axis labels */}
              <text x="35" y="24" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">100%</text>
              <text x="35" y="66" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">75%</text>
              <text x="35" y="109" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">50%</text>
              <text x="35" y="151" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">25%</text>
              <text x="35" y="193" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">0%</text>

              {/* Bars and X-Axis Labels */}
              {activeData.departments.map((dept, idx) => {
                const totalBars = activeData.departments.length;
                const availableWidth = barChartWidth - startX - barPadding * 2;
                const spacing = availableWidth / totalBars;
                const x = startX + barPadding + idx * spacing;

                const maxBarHeight = 170;
                const currentHeight = (dept.value / 100) * maxBarHeight;
                const y = 190 - currentHeight;

                const isEngineering = dept.name === 'Engineering';

                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={currentHeight}
                      rx="6"
                      fill={isEngineering ? '#FF5A1F' : '#E2E8F0'}
                      className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                      title={`${dept.name}: ${dept.value}% utilized`}
                    />
                    <text
                      x={x + barWidth / 2}
                      y="210"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#64748B"
                    >
                      {dept.name.length > 10 ? dept.name.substring(0, 8) + '...' : dept.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Line Chart Panel */}
        <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-border-color">
            <h3 className="font-heading text-sm font-extrabold text-text-primary">Maintenance Requests Over Time</h3>
            <div className="relative">
              <select className="border border-border-color bg-white px-3 py-1 rounded-lg text-[11px] font-bold text-text-secondary focus:outline-none pr-6 cursor-pointer appearance-none">
                <option>Last 15 Days</option>
              </select>
              <ChevronDownIcon size={10} className="absolute right-2 top-2.5 text-text-secondary pointer-events-none" />
            </div>
          </div>

          {/* SVG Line Chart Graphic */}
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} width="100%" height="220">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8A5CF5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8A5CF5" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="30" x2="460" y2="30" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="40" y1="70" x2="460" y2="70" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="40" y1="110" x2="460" y2="110" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="40" y1="150" x2="460" y2="150" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="40" y1="190" x2="460" y2="190" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Y-Axis labels */}
              <text x="25" y="34" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">40</text>
              <text x="25" y="74" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">30</text>
              <text x="25" y="114" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">20</text>
              <text x="25" y="154" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">10</text>
              <text x="25" y="194" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">0</text>

              {/* Shaded Area fill */}
              <path
                d={getAreaPath(activeData.maintenanceLine)}
                fill="url(#areaGradient)"
                className="transition-all duration-500"
              />

              {/* Main Line path */}
              <path
                d={getLinePath(activeData.maintenanceLine)}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />

              {/* Node Circle Markers & X-Axis labels */}
              {activeData.maintenanceLine.map((val, idx) => {
                const pointsCount = activeData.maintenanceLine.length;
                const stepX = (lineChartWidth - linePaddingX * 2) / (pointsCount - 1);
                const scaleY = (lineChartHeight - linePaddingY * 2) / 40;

                const cx = linePaddingX + idx * stepX;
                const cy = lineChartHeight - linePaddingY - val * scaleY;

                return (
                  <g key={idx}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill="#8A5CF5"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-500"
                    />
                    <text
                      x={cx}
                      y="210"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#94A3B8"
                    >
                      {activeData.lineDates[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      {/* Phase 5: Trend Insights & Predictive Forecast Banner (Between Chart Sections) */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-[#F5F3FF] via-[#EFF6FF] to-[#FFF4EF] border border-indigo-200/70 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <h4 className="font-heading text-xs font-black text-indigo-950 uppercase tracking-wider">
                AI Trend Analysis & Quarterly Expenditure Insights
              </h4>
            </div>
            <p className="text-xs font-semibold text-text-primary leading-relaxed m-0">
              {aiSummary.trendAnalysis}
            </p>
          </div>

          <div className="flex flex-col gap-1 md:max-w-md bg-white/80 border border-indigo-200/60 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-black text-primary-orange uppercase tracking-wider flex items-center gap-1">
              <span>🔮 Predictive Reliability Forecast</span>
            </span>
            <span className="text-xs font-bold text-text-secondary leading-snug">
              {aiSummary.predictiveForecast}
            </span>
          </div>
        </div>
      )}

      {/* 2. Three Metric Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Most Used Assets */}
        <div className="bg-white border border-border-color rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3 border-b border-border-color pb-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-primary-orange-light text-primary-orange flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h4 className="font-heading text-xs font-extrabold text-text-primary">Most Used Assets</h4>
          </div>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {activeData.mostUsed.map((mu, i) => (
              <li key={i} className="flex justify-between items-center text-xs font-bold text-text-primary">
                <span className="text-text-secondary font-medium">{mu.name}</span>
                <span className="text-text-primary">{mu.bookings} {mu.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 2: Idle Assets */}
        <div className="bg-white border border-border-color rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3 border-b border-border-color pb-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#8A5CF5] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h4 className="font-heading text-xs font-extrabold text-text-primary">Idle Assets</h4>
          </div>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {activeData.idle.map((id, i) => (
              <li key={i} className="flex justify-between items-center text-xs font-bold text-text-primary">
                <span className="text-text-secondary font-medium">{id.name}</span>
                <span className="text-text-primary">{id.days}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Total Bookings */}
        <div className="bg-white border border-border-color rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center gap-3 border-b border-border-color pb-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-primary-orange-light text-primary-orange flex items-center justify-center shrink-0">
              <CalendarIcon size={16} />
            </div>
            <h4 className="font-heading text-xs font-extrabold text-text-primary">Total Bookings (This Month)</h4>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-3xl font-black text-text-primary leading-none">
              {activeData.bookingsCount}
            </span>
            <span className="text-[11px] font-extrabold text-success-green-text flex items-center gap-1 mt-0.5">
              {activeData.trend}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Grid: Maintenance due list and Export utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table layout of due items */}
        <div className="bg-white border border-border-color rounded-2xl shadow-sm overflow-hidden flex flex-col gap-3 lg:col-span-2">
          <div className="flex justify-between items-center p-4 pb-2">
            <h3 className="font-heading text-sm font-extrabold text-text-primary m-0">
              Assets Due for Maintenance / Nearing Retirement
            </h3>
            <button 
              className="border border-primary-orange text-primary-orange hover:bg-primary-orange-light text-xs font-extrabold py-1.5 px-3 rounded-lg transition cursor-pointer bg-white"
              onClick={() => alert('Viewing all due listings')}
            >
              View all
            </button>
          </div>

          <table className="w-full border-collapse text-left">
            <thead className="bg-bg-gray border-b border-border-color">
              <tr>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Asset</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Issue</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Due In / Age</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeData.dueMaintenance.map((item, i) => (
                <tr key={i} className="border-b border-border-color last:border-b-0">
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary-orange-light text-primary-orange flex items-center justify-center shrink-0">
                        {item.isAsset ? <WrenchIcon size={14} /> : <LaptopIcon size={14} />}
                      </div>
                      <span className="font-bold text-xs text-text-primary">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-text-primary">
                    {item.issue}
                  </td>
                  <td className="p-4 text-xs font-bold text-text-primary">{item.due}</td>
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'Due Soon' 
                        ? 'bg-orange-50 text-primary-orange border-primary-orange-border/20' 
                        : 'bg-purple-50 text-[#8A5CF5] border-purple-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side: Export utility */}
        <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm flex flex-col justify-center gap-4 lg:col-span-1">
          <h4 className="font-heading text-sm font-extrabold text-text-primary m-0">Export Report</h4>
          <p className="text-xs font-semibold text-text-secondary leading-relaxed m-0">
            Download detailed reports for analysis and sharing.
          </p>
          <button 
            className="bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-extrabold py-3.5 px-6 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 w-full disabled:opacity-40 disabled:cursor-not-allowed" 
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <svg className="animate-spin-custom w-4.5 h-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon size={16} />
                Export Report
              </>
            )}
          </button>
        </div>

      </div>

      {/* 4. Footer Banner Info */}
      <div className="bg-primary-orange-light border border-primary-orange-border/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="text-primary-orange flex items-center shrink-0">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="text-xs font-semibold text-primary-orange leading-relaxed m-0">
          Reports and AI Strategic Narratives are updated in real-time. Use filters to evaluate specific departments, asset categories, or time cycles.
        </p>
      </div>

    </div>
  );
}
