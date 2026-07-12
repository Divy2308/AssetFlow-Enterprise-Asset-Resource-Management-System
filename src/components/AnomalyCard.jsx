import React, { useState } from 'react';
import { ChevronRightIcon } from './Icons';

export default function AnomalyCard({ anomaly, onDismiss, onAction }) {
  const [dismissing, setDismissing] = useState(false);

  if (!anomaly) return null;

  const handleDismissClick = async () => {
    setDismissing(true);
    if (onDismiss) {
      await onDismiss(anomaly.id);
    }
  };

  const getSeverityBadge = (severity, category) => {
    const sevUpper = (severity || 'WARNING').toUpperCase();
    if (sevUpper === 'CRITICAL' || category === 'MAINTENANCE_SURGE') {
      return {
        pill: 'bg-red-100 text-red-700 border-red-300',
        border: 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/40 to-white',
        icon: '🔴',
        label: 'RAPID DEPRECIATION / CRITICAL'
      };
    } else if (sevUpper === 'HIGH' || category === 'OVERDUE_PATTERN') {
      return {
        pill: 'bg-orange-100 text-orange-700 border-orange-300',
        border: 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/40 to-white',
        icon: '⏰',
        label: 'OVERDUE PATTERN / HIGH RISK'
      };
    } else if (category === 'RESOURCE_IMBALANCE') {
      return {
        pill: 'bg-blue-100 text-blue-700 border-blue-300',
        border: 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/40 to-white',
        icon: '🏢',
        label: 'RESOURCE IMBALANCE'
      };
    } else if (category === 'COST_ANOMALY') {
      return {
        pill: 'bg-purple-100 text-purple-700 border-purple-300',
        border: 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/40 to-white',
        icon: '💰',
        label: 'COST EXPENDITURE ANOMALY'
      };
    }
    // Default Warning / Unusual Booking
    return {
      pill: 'bg-amber-100 text-amber-800 border-amber-300',
      border: 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/40 to-white',
      icon: '⚠️',
      label: 'UNUSUAL PATTERN'
    };
  };

  const styleInfo = getSeverityBadge(anomaly.severity, anomaly.category);

  return (
    <div className={`border border-border-color rounded-2xl p-5 shadow-xs transition-all duration-300 flex flex-col gap-3.5 ${styleInfo.border}`}>
      
      {/* Top row: Category/Severity Badge & Timestamp */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider border ${styleInfo.pill}`}>
          <span>{styleInfo.icon}</span>
          <span>{styleInfo.label}</span>
        </span>
        <span className="text-[11px] font-bold text-text-secondary">
          Detected {anomaly.detected_at ? new Date(anomaly.detected_at).toLocaleDateString() : 'Recently'}
        </span>
      </div>

      {/* Main Title and Description */}
      <div className="flex flex-col gap-1">
        <h4 className="font-heading text-sm font-extrabold text-text-primary leading-snug">
          {anomaly.title}
        </h4>
        <p className="text-xs font-semibold text-text-secondary leading-relaxed m-0">
          {anomaly.description}
        </p>
      </div>

      {/* Recommendation Box */}
      {anomaly.recommendation && (
        <div className="bg-white/80 border border-border-color/80 rounded-xl p-3 flex flex-col gap-1 text-xs">
          <span className="font-extrabold text-text-primary uppercase tracking-wider text-[10px] text-primary-orange flex items-center gap-1">
            <span>💡 AI Strategic Recommendation:</span>
          </span>
          <span className="font-semibold text-text-secondary leading-normal">
            {anomaly.recommendation}
          </span>
        </div>
      )}

      {/* Action Buttons Row: [Dismiss] & [Action Button] */}
      <div className="flex items-center justify-between pt-1 border-t border-border-color/50 mt-1 flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDismissClick}
          disabled={dismissing}
          className="border border-border-color bg-white hover:bg-bg-gray text-text-secondary hover:text-text-primary text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs disabled:opacity-50"
        >
          {dismissing ? "Dismissing..." : "Dismiss Alert"}
        </button>

        <button
          type="button"
          onClick={() => onAction && onAction(anomaly)}
          className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold px-4.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>{anomaly.action_text || "View Details"}</span>
          <ChevronRightIcon size={14} />
        </button>
      </div>

    </div>
  );
}
