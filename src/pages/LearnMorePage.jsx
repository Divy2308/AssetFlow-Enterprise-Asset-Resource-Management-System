import React from 'react';
import { 
  BoxIcon, 
  OrgSetupIcon, 
  AssetsIcon, 
  TransferIcon, 
  CalendarIcon, 
  WrenchIcon, 
  ShieldIcon, 
  ReportsIcon 
} from '../components/Icons';

export default function LearnMorePage() {
  const modules = [
    { title: 'Dashboard', desc: 'Real-time overview of available, allocated, and under-maintenance assets alongside active resource bookings and chronological activity feeds.', Icon: BoxIcon },
    { title: 'Organization Setup', desc: 'Central command for configuring departments, asset category custom schemas, and hiring/promoting employees.', Icon: OrgSetupIcon },
    { title: 'Asset Registration', desc: 'Register hardware tags and office furniture serials, cycle status conditions, and handle secure item disposals.', Icon: AssetsIcon },
    { title: 'Allocation & Transfer', desc: 'Allocate assets directly to employees. System locks occupied items and routes double-allocation conflicts to Transfer Requests.', Icon: TransferIcon },
    { title: 'Resource Booking', desc: 'Book meeting rooms and projector devices using a 24-hour scrollable timeline featuring overlap conflict checkers.', Icon: CalendarIcon },
    { title: 'Maintenance Kanban', desc: 'Kanban workflow to transition broken equipment from pending, to technician assignment, and back to available once resolved.', Icon: WrenchIcon },
    { title: 'Asset Auditing', desc: 'Launch department or location audit verification cycles, assign auditors, and log asset discrepancy verification results.', Icon: ShieldIcon }
  ];

  return (
    <div className="bg-white border border-border-color rounded-2xl p-8 shadow-sm max-w-4xl mx-auto flex flex-col gap-6">
      <div className="border-b border-border-color pb-4">
        <h2 className="font-heading text-2xl font-extrabold text-text-primary mb-2">Welcome to AssetFlow</h2>
        <p className="text-sm font-semibold text-text-secondary">Enterprise Resource & Asset Management System</p>
      </div>

      <p className="text-sm text-text-primary leading-relaxed font-medium">
        AssetFlow is designed to simplify tracking critical business resources, preventing double-bookings, managing repair pipelines, and conducting full asset audit cycles in a single, secure interface.
      </p>

      <h3 className="font-heading text-base font-extrabold text-text-primary mt-2">Explore the Modules:</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m, idx) => (
          <div key={idx} className="flex gap-4 p-4 border border-border-color rounded-xl hover:bg-bg-gray/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary-orange-light text-primary-orange flex items-center justify-center shrink-0">
              <m.Icon size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-extrabold text-text-primary">{m.title}</h4>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
