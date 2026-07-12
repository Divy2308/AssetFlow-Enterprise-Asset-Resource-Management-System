import React, { useState } from 'react';
import {
  CalendarIcon,
  InfoIcon,
  DownloadIcon,
  SlidersIcon,
  WrenchIcon,
  LaptopIcon,
  UsersIcon,
  BoxIcon
} from '../components/Icons';

export default function ReportsPage() {
  // 1. Date Period Filter State
  const [dateRange, setDateRange] = useState('1 - 15 Jul 2026');

  // 2. Export Simulation Loader State
  const [exporting, setExporting] = useState(false);

  // 3. Dynamic Datasets based on Date Period
  const datasets = {
    '1 - 15 Jul 2026': {
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
      lineDates: ['1 Jul', '3 Jul', '5 Jul', '7 Jul', '9 Jul', '11 Jul', '13 Jul', '15 Jul']
    },
    '16 - 30 Jul 2026': {
      bookingsCount: 184,
      trend: '↑ 18% vs last month',
      departments: [
        { name: 'Engineering', value: 82 },
        { name: 'IT', value: 68 },
        { name: 'HR', value: 52 },
        { name: 'Operations', value: 75 },
        { name: 'Admin', value: 60 },
        { name: 'Finance', value: 48 }
      ],
      maintenanceLine: [14, 20, 26, 21, 30, 36, 39, 44],
      lineDates: ['17 Jul', '19 Jul', '21 Jul', '23 Jul', '25 Jul', '27 Jul', '29 Jul', '30 Jul']
    }
  };

  const activeData = datasets[dateRange] || datasets['1 - 15 Jul 2026'];

  // Trigger simulated report download
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Success! Detailed PDF Report for cycle (${dateRange}) has been downloaded successfully.`);
    }, 1500);
  };

  // Helper to compute SVG coordinates for the bar chart
  const barChartWidth = 520;
  const barChartHeight = 220;
  const barPadding = 24;
  const barWidth = 36;
  const startX = 50;

  // Helper to compute SVG coordinates for the line chart
  const lineChartWidth = 500;
  const lineChartHeight = 220;
  const linePaddingX = 40;
  const linePaddingY = 30;

  // Generate SVG path for the line graph
  const getLinePath = (dataPoints) => {
    const pointsCount = dataPoints.length;
    const stepX = (lineChartWidth - linePaddingX * 2) / (pointsCount - 1);
    
    // Scale values so that max value (40) maps to lineChartHeight - linePaddingY (top border margin)
    // 0 maps to lineChartHeight - linePaddingY
    const scaleY = (lineChartHeight - linePaddingY * 2) / 40;

    return dataPoints.map((val, idx) => {
      const x = linePaddingX + idx * stepX;
      const y = lineChartHeight - linePaddingY - val * scaleY;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate SVG path to fill the area under the line graph
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dynamic Sub-header Info & Top-Right Period Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-8px', marginBottom: '8px', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Track utilization, maintenance, and asset performance
        </span>

        {/* Date Selector and Filters triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="icon-select-input" style={{ width: '220px' }}>
            <span className="select-icon-left" style={{ color: 'var(--primary-orange)' }}>
              <CalendarIcon size={16} />
            </span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ paddingLeft: '42px', height: '42px', fontSize: '13px', fontWeight: '700' }}
            >
              <option value="1 - 15 Jul 2026">1 - 15 Jul 2026</option>
              <option value="16 - 30 Jul 2026">16 - 30 Jul 2026</option>
            </select>
          </div>

          <button 
            className="btn-outline-orange"
            style={{ height: '42px', padding: '0 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
            onClick={() => alert('Filter overlays drawer toggled')}
          >
            <SlidersIcon size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* 1. Charts Analytics Row */}
      <div className="reports-charts-grid">
        
        {/* Bar Chart Panel */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Utilization by Department</h3>
            <select className="chart-select">
              <option>This Month</option>
            </select>
          </div>

          {/* SVG Bar Chart Graphic */}
          <div style={{ width: '100%', overflowX: 'auto' }}>
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
              <text x="35" y="194" textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">0%</text>

              {/* Draw columns */}
              {activeData.departments.map((dept, idx) => {
                const totalBarSpace = (barChartWidth - 80) / activeData.departments.length;
                const x = startX + idx * totalBarSpace + (totalBarSpace - barWidth) / 2;
                
                // Scale so that 100% is 170px height (drawn from y=190 to y=20)
                const barHeight = (dept.value / 100) * 170;
                const y = 190 - barHeight;

                return (
                  <g key={idx} className="chart-bar-group">
                    {/* Orange Bar rect */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      ry="4"
                      fill="var(--primary-orange)"
                      style={{ transition: 'all 0.4s ease' }}
                    />
                    {/* Count overlay label */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="var(--text-primary)"
                    >
                      {dept.value}%
                    </text>
                    {/* X-Axis labels */}
                    <text
                      x={x + barWidth / 2}
                      y="208"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="var(--text-secondary)"
                    >
                      {dept.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Line Chart Panel */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Maintenance Frequency</h3>
            <select className="chart-select">
              <option>This Month</option>
            </select>
          </div>

          {/* SVG Line Chart Graphic */}
          <div>
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} width="100%" height="220">
              <defs>
                {/* Area Gradient under curve */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-orange)" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="var(--primary-orange)" stopOpacity="0.0" />
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
                style={{ transition: 'all 0.4s ease' }}
              />

              {/* Main Line path */}
              <path
                d={getLinePath(activeData.maintenanceLine)}
                fill="none"
                stroke="var(--primary-orange)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'all 0.4s ease' }}
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
                    {/* Node Dot circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5"
                      fill="var(--primary-orange)"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      style={{ transition: 'all 0.4s ease' }}
                    />
                    {/* X-Axis labels */}
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

      {/* 2. Three Metric Statistics Row */}
      <div className="report-metrics-row">
        
        {/* Card 1: Most Used Assets */}
        <div className="report-metric-card">
          <div className="metric-card-header">
            <div className="metric-icon-box orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h4 className="metric-card-title">Most Used Assets</h4>
          </div>
          <ul className="metric-card-list">
            <li className="metric-card-item">
              <span className="item-label">Room B2</span>
              <span className="item-value">34 bookings</span>
            </li>
            <li className="metric-card-item">
              <span className="item-label">Van AF-343</span>
              <span className="item-value">21 trips</span>
            </li>
            <li className="metric-card-item">
              <span className="item-label">Projector AF-335</span>
              <span className="item-value">18 uses</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Idle Assets */}
        <div className="report-metric-card">
          <div className="metric-card-header">
            <div className="metric-icon-box purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h4 className="metric-card-title">Idle Assets</h4>
          </div>
          <ul className="metric-card-list">
            <li className="metric-card-item">
              <span className="item-label">Camera AF-0301</span>
              <span className="item-value">60+ days</span>
            </li>
            <li className="metric-card-item">
              <span className="item-label">Chair AF-0410</span>
              <span className="item-value">45 days</span>
            </li>
            <li className="metric-card-item">
              <span className="item-label">Printer AF-2201</span>
              <span className="item-value">30 days</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Total Bookings */}
        <div className="report-metric-card" style={{ gap: '6px' }}>
          <div className="metric-card-header">
            <div className="metric-icon-box orange">
              <CalendarIcon size={16} />
            </div>
            <h4 className="metric-card-title">Total Bookings (This Month)</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
              {activeData.bookingsCount}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {activeData.trend}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Grid: Maintenance due list and Export utilities */}
      <div className="report-bottom-grid">
        
        {/* Table layout of due items */}
        <div className="table-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 8px 24px' }}>
            <h3 className="section-title" style={{ margin: 0, fontSize: '15px' }}>
              Assets Due for Maintenance / Nearing Retirement
            </h3>
            <button 
              className="btn-outline-orange"
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
              onClick={() => alert('Viewing all due listings')}
            >
              View all
            </button>
          </div>

          <table className="org-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Issue</th>
                <th>Due In / Age</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FFF4EF', color: '#FF5A1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <WrenchIcon size={14} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>Forklift AF-0087</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Service due in <span style={{ color: 'var(--alert-red-text)', fontWeight: '700' }}>5 days</span>
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>5 days</span>
                </td>
                <td>
                  <span className="status-badge pending" style={{ padding: '4px 8px', fontSize: '11px' }}>
                    Due Soon
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FFF4EF', color: '#FF5A1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LaptopIcon size={14} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>Laptop AF-0020</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>4 years old</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nearing retirement</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>30 days</span>
                </td>
                <td>
                  <span className="status-badge in-progress" style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#F5F3FF', color: '#8A5CF5' }}>
                    Nearing Retirement
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right side: Export utility */}
        <div className="export-report-card">
          <h4 className="chart-title" style={{ margin: 0 }}>Export Report</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '2px 0' }}>
            Download detailed reports for analysis and sharing.
          </p>
          <button 
            className="btn-export-solid" 
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <svg className="animate-spin" style={{ width: '16px', height: '16px', color: '#FFF' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      <div className="info-banner" style={{ marginTop: '8px' }}>
        <div className="info-banner-icon">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="info-banner-text">
          Reports are updated in real-time. Use filters to view specific departments, asset categories, or time periods.
        </p>
      </div>

    </div>
  );
}
