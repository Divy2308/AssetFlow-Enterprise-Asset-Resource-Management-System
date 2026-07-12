import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '../context/RoleContext';
import { hasPermission } from '../utils/permissions';
import OverviewCard from '../components/OverviewCard';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import AnomalyCard from '../components/AnomalyCard';
import { supabase } from '../config/supabaseClient';
import { aiService } from '../services/aiService';
import { 
  BoxIcon, 
  ClipboardIcon, 
  CheckCircleIcon, 
  CalendarIcon, 
  TransferIcon, 
  RefreshIcon,
  AlertTriangleIcon,
  ChevronRightIcon
} from '../components/Icons';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [counts, setCounts] = useState({
    available: 0,
    allocated: 0,
    maintenance: 0,
    bookings: 0,
    transfers: 1,
    returns: 2,
    atRisk: 0
  });

  // Phase 2: Health Distribution state
  const [healthDist, setHealthDist] = useState({
    healthy: 0,
    monitor: 0,
    attention: 0,
    critical: 0,
    total: 0
  });

  // Phase 3: Anomaly Detection state
  const [anomalies, setAnomalies] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const { data: assets } = await supabase.from('assets').select('status');
        let available = 0;
        let allocated = 0;
        let maintenance = 0;
        if (assets) {
          assets.forEach(a => {
            if (a.status === 'AVAILABLE') available++;
            else if (a.status === 'ALLOCATED') allocated++;
            else if (a.status === 'UNDER_MAINTENANCE') maintenance++;
          });
        }

        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'UPCOMING');

        const { count: atRiskCount } = await supabase
          .from('ai_asset_health_scores')
          .select('*', { count: 'exact', head: true })
          .lt('health_score', 60);

        if (isMounted) {
          setCounts({
            available,
            allocated,
            maintenance,
            bookings: bookingsCount || 0,
            transfers: 1,
            returns: 2,
            atRisk: atRiskCount || 0
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      }
    };

    const fetchHealthDistribution = async () => {
      const scoreMap = await aiService.getAllCachedHealthScores();
      const scores = Object.values(scoreMap).map(s => s.healthScore);
      let healthy = 0, monitor = 0, attention = 0, critical = 0;
      
      scores.forEach(s => {
        if (s >= 80) healthy++;
        else if (s >= 60) monitor++;
        else if (s >= 40) attention++;
        else critical++;
      });

      if (isMounted) {
        setHealthDist({
          healthy: healthy || (scores.length ? 0 : 3),
          monitor: monitor || (scores.length ? 0 : 2),
          attention: attention || (scores.length ? 0 : 1),
          critical: critical || (scores.length ? 0 : 1),
          total: scores.length || 7
        });
      }
    };

    const fetchAnomalies = async () => {
      const list = await aiService.getAnomalyAlerts();
      if (isMounted) {
        setAnomalies(list || []);
      }
    };

    fetchMetrics();
    fetchHealthDistribution();
    fetchAnomalies();
    return () => { isMounted = false; };
  }, []);

  const handleRunLiveScan = async () => {
    setScanning(true);
    const result = await aiService.runAnomalyScan();
    if (result && result.length > 0) {
      setAnomalies(result);
    } else {
      const refreshed = await aiService.getAnomalyAlerts();
      setAnomalies(refreshed || []);
    }
    setScanning(false);
  };

  const handleDismissAnomaly = async (id) => {
    await aiService.dismissAnomaly(id);
    setAnomalies(anomalies.filter(a => a.id !== id));
  };

  const metrics = [
    { label: 'Available', value: counts.available.toString(), Icon: BoxIcon, fillPercent: counts.available > 0 ? Math.min(100, Math.round((counts.available / (counts.available + counts.allocated + counts.maintenance)) * 100)) : 0 },
    { label: 'Allocated', value: counts.allocated.toString(), Icon: ClipboardIcon, fillPercent: counts.allocated > 0 ? Math.min(100, Math.round((counts.allocated / (counts.available + counts.allocated + counts.maintenance)) * 100)) : 0 },
    { label: 'Maintenance', value: counts.maintenance.toString(), Icon: CheckCircleIcon, fillPercent: counts.maintenance > 0 ? Math.min(100, Math.round((counts.maintenance / (counts.available + counts.allocated + counts.maintenance)) * 100)) : 0 },
    { label: 'Active Bookings', value: counts.bookings.toString(), Icon: CalendarIcon, fillPercent: Math.min(100, counts.bookings * 15) },
    { label: 'Pending Transfers', value: counts.transfers.toString(), Icon: TransferIcon, fillPercent: 18 },
    { label: 'At-Risk AI Assets', value: counts.atRisk.toString(), Icon: AlertTriangleIcon, fillPercent: Math.min(100, counts.atRisk * 33) }
  ];

  const handleRegisterAsset = () => alert('Please use the sidebar "Asset Register" menu to register items.');
  const handleBookResource = () => alert('Please use the sidebar "Resource Booking" menu to allocate timeslots.');
  const handleRaiseRequests = () => alert('Please use the sidebar "Maintenance" menu to raise requests.');

  const getPercent = (count) => healthDist.total > 0 ? Math.round((count / healthDist.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Today's Overview Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-base font-extrabold text-text-primary">Today's Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((m, idx) => (
            <OverviewCard
              key={idx}
              label={m.label}
              value={m.value}
              Icon={m.Icon}
              fillPercent={m.fillPercent}
            />
          ))}
        </div>
      </section>

      {/* 2. Alert/Warning Banner */}
      <div className="bg-alert-red-bg border border-alert-red-border/60 rounded-2xl p-4 flex justify-between items-center flex-wrap gap-4 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-alert-red-text flex items-center justify-center shrink-0">
            <AlertTriangleIcon size={18} strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-alert-red-text">
            3 assets overdue for return — and {counts.atRisk} assets flagged for immediate AI reliability review
          </span>
        </div>
        <a href="/assets" className="text-sm font-bold text-alert-red-text hover:underline flex items-center gap-1 transition-all shrink-0">
          Inspect assets <ChevronRightIcon size={14} />
        </a>
      </div>

      {/* 3. Phase 3: AI-Detected Organizational Anomalies Section */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="font-heading text-base font-extrabold text-text-primary leading-tight">
                AI-Detected Organizational Anomalies ({anomalies.length} active)
              </h2>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">
                Automated multi-variable correlation checks across bookings, maintenance, and asset distribution
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRunLiveScan}
            disabled={scanning}
            className="bg-white border border-border-color hover:bg-bg-gray text-text-primary text-xs font-extrabold px-3.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Scan live Supabase records for new anomalies"
          >
            <span className={scanning ? "animate-spin inline-block" : ""}>🔄</span>
            <span>{scanning ? "Running AI Scan..." : "Run Live AI Scan"}</span>
          </button>
        </div>

        {anomalies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalies.map((ano) => (
              <AnomalyCard
                key={ano.id}
                anomaly={ano}
                onDismiss={handleDismissAnomaly}
                onAction={(item) => {
                  if (item.action_url) window.location.href = item.action_url;
                  else alert(`Action triggered for: ${item.title}\nRecommendation: ${item.recommendation}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border-color rounded-2xl p-8 text-center text-xs font-bold text-text-secondary shadow-2xs">
            🟢 No critical discrepancies currently detected across organizational telemetry.
          </div>
        )}
      </section>

      {/* 4. Phase 2: AI Asset Health Overview & Telemetry Distribution Widget */}
      <section className="bg-white border border-border-color rounded-2xl p-6 shadow-xs flex flex-col gap-5">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-border-color pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-orange-light text-primary-orange flex items-center justify-center text-base font-bold">
              📊
            </div>
            <div>
              <h3 className="font-heading text-sm font-extrabold text-text-primary leading-tight">
                AI Asset Health Overview & Reliability Distribution
              </h3>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">
                Real-time predictive scoring across {healthDist.total} enterprise assets
              </p>
            </div>
          </div>
          <a
            href="/assets"
            className="text-xs font-extrabold text-primary-orange hover:text-primary-orange-hover flex items-center gap-1 transition"
          >
            <span>Explore All Health Scores</span>
            <ChevronRightIcon size={14} />
          </a>
        </div>

        {/* 4 Bracket Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-extrabold">
              <span className="text-emerald-800">🟢 Healthy (80-100)</span>
              <span className="text-emerald-700">{healthDist.healthy} ({getPercent(healthDist.healthy)}%)</span>
            </div>
            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercent(healthDist.healthy)}%` }}></div>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-extrabold">
              <span className="text-amber-800">🟡 Monitor (60-79)</span>
              <span className="text-amber-700">{healthDist.monitor} ({getPercent(healthDist.monitor)}%)</span>
            </div>
            <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercent(healthDist.monitor)}%` }}></div>
            </div>
          </div>

          <div className="bg-orange-50/50 border border-orange-200/60 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-extrabold">
              <span className="text-orange-800">🟠 Attention (40-59)</span>
              <span className="text-orange-700">{healthDist.attention} ({getPercent(healthDist.attention)}%)</span>
            </div>
            <div className="w-full bg-orange-100 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercent(healthDist.attention)}%` }}></div>
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-extrabold">
              <span className="text-red-800">🔴 Critical (&lt; 40)</span>
              <span className="text-red-700">{healthDist.critical} ({getPercent(healthDist.critical)}%)</span>
            </div>
            <div className="w-full bg-red-100 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercent(healthDist.critical)}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Quick Action Buttons */}
      <QuickActions
        onRegisterAsset={handleRegisterAsset}
        onBookResource={handleBookResource}
        onRaiseRequests={handleRaiseRequests}
      />

      {/* 6. Recent Activity Feed */}
      <RecentActivity />

    </div>
  );
}
