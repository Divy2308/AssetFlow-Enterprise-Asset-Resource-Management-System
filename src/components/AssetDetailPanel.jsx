import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';

export default function AssetDetailPanel({ asset, onClose, onScoreUpdated }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (!asset) return;
    let isMounted = true;

    const fetchHealth = async () => {
      setLoading(true);
      const result = await aiService.getAssetHealthScore(asset.id, false, asset);
      if (isMounted) {
        setHealthData(result);
        setLoading(false);
      }
    };

    fetchHealth();
    return () => { isMounted = false; };
  }, [asset]);

  const handleRecalculate = async () => {
    if (!asset) return;
    setRecalculating(true);
    const result = await aiService.getAssetHealthScore(asset.id, true, asset);
    setHealthData(result);
    setRecalculating(false);
    if (onScoreUpdated && asset.id && result) {
      onScoreUpdated(asset.id, result);
    }
  };

  if (!asset) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-300', light: 'bg-emerald-50', label: 'Healthy' };
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-300', light: 'bg-amber-50', label: 'Monitor' };
    if (score >= 40) return { text: 'text-orange-600', bg: 'bg-orange-500', border: 'border-orange-300', light: 'bg-orange-50', label: 'Attention Needed' };
    return { text: 'text-red-600', bg: 'bg-red-500', border: 'border-red-300', light: 'bg-red-50', label: 'Critical Risk' };
  };

  const scoreInfo = getScoreColor(healthData ? healthData.healthScore : 85);

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-end z-50 animate-fadeIn">
      <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col border-l border-border-color overflow-y-auto animate-slideLeft">
        
        {/* Header */}
        <div className="p-6 border-b border-border-color bg-[#FFFDFB] sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-orange-light text-primary-orange flex items-center justify-center text-xl font-bold shadow-xs">
              📊
            </div>
            <div>
              <h3 className="font-heading text-base font-extrabold text-text-primary leading-tight">
                Asset Health & Reliability Score
              </h3>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">
                AI Diagnostic Overview for <span className="font-extrabold text-text-primary">{asset.tag} — {asset.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-gray hover:bg-gray-200 text-text-secondary hover:text-text-primary flex items-center justify-center text-lg font-bold transition cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          
          {/* Asset Basic Specs Box */}
          <div className="bg-bg-gray border border-border-color rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-text-secondary block">Category / Type</span>
              <span className="font-extrabold text-text-primary">{asset.category_name || asset.type || 'General'}</span>
            </div>
            <div>
              <span className="font-bold text-text-secondary block">Current Condition</span>
              <span className="font-extrabold text-text-primary">{asset.condition || 'Good'}</span>
            </div>
            <div>
              <span className="font-bold text-text-secondary block">Operational Status</span>
              <span className="font-extrabold text-text-primary">{asset.status || 'AVAILABLE'}</span>
            </div>
            <div>
              <span className="font-bold text-text-secondary block">Assigned Location</span>
              <span className="font-extrabold text-text-primary">{asset.location || 'Headquarters'}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-10 h-10 border-3 border-primary-orange border-t-transparent rounded-full animate-spin"></div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-extrabold text-text-primary">Calculating AI Reliability Gauge...</span>
                <span className="text-xs font-semibold text-text-secondary">Evaluating age curves, maintenance cycles, and stress telemetry</span>
              </div>
            </div>
          ) : healthData ? (
            <div className="flex flex-col gap-6">
              
              {/* Health Gauge Banner Card */}
              <div className={`border rounded-2xl p-6 flex items-center justify-between shadow-xs ${scoreInfo.light} ${scoreInfo.border}`}>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Composite Health Gauge</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-extrabold font-heading ${scoreInfo.text}`}>
                      {healthData.healthScore}
                    </span>
                    <span className="text-sm font-bold text-text-secondary">/ 100</span>
                  </div>
                  <span className={`text-xs font-extrabold mt-1 inline-block ${scoreInfo.text}`}>
                    ● {scoreInfo.label} ({healthData.riskLevel} RISK)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRecalculate}
                  disabled={recalculating}
                  className="bg-white border border-border-color hover:bg-gray-100 text-text-primary px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Run real-time recalculation"
                >
                  <span className={recalculating ? "animate-spin inline-block" : ""}>🔄</span>
                  <span>{recalculating ? "Recalculating..." : "Live Recalculate"}</span>
                </button>
              </div>

              {/* Contributing Factors Breakdown */}
              <div className="bg-white border border-border-color rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-color pb-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Contributing Telemetry Factors</span>
                  </h4>
                  <span className="text-[10px] font-bold text-text-secondary">Score Weighting</span>
                </div>

                <div className="flex flex-col gap-3.5">
                  {/* Age Score Factor */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-primary">Lifecycle Age Integrity</span>
                      <span className="text-text-secondary">{healthData.factors?.age_score || 80}%</span>
                    </div>
                    <div className="w-full bg-bg-gray h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${healthData.factors?.age_score || 80}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Maintenance Frequency Factor */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-primary">Maintenance Reliability Record</span>
                      <span className="text-text-secondary">{healthData.factors?.maintenance_frequency || 80}%</span>
                    </div>
                    <div className="w-full bg-bg-gray h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${healthData.factors?.maintenance_frequency || 80}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Condition Trend Factor */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-primary">Physical & Functional Condition</span>
                      <span className="text-text-secondary">{healthData.factors?.condition_trend || 80}%</span>
                    </div>
                    <div className="w-full bg-bg-gray h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${healthData.factors?.condition_trend || 80}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Usage Intensity Factor */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-primary">Usage & Allocation Intensity</span>
                      <span className="text-text-secondary">{healthData.factors?.usage_intensity || 80}%</span>
                    </div>
                    <div className="w-full bg-bg-gray h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${healthData.factors?.usage_intensity || 80}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Predictive Lifecycle Forecast Card */}
              <div className="bg-gradient-to-br from-[#FFF8F5] to-white border border-[#FFE0D1] rounded-2xl p-5 shadow-2xs flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-primary-orange">
                  <span className="text-lg">🔮</span>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">AI Predictive Lifecycle Forecast</h4>
                </div>
                <p className="text-xs font-semibold text-text-secondary leading-relaxed">
                  {healthData.prediction}
                </p>
                <div className="text-[10px] font-bold text-text-secondary border-t border-border-color/60 pt-2.5 mt-1 flex justify-between">
                  <span>Model: Gemini 2.5 Reliability Engine</span>
                  <span>Updated: {healthData.lastCalculatedAt ? new Date(healthData.lastCalculatedAt).toLocaleDateString() : 'Just now'}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary text-xs font-semibold">
              Could not compute health telemetry for this asset.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-color bg-bg-gray sticky bottom-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-border-color hover:bg-gray-100 text-text-primary text-xs font-extrabold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
