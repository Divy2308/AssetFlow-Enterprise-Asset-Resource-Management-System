import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-white border border-border-color rounded-2xl p-8 shadow-sm max-w-4xl mx-auto flex flex-col gap-6">
      <div className="border-b border-border-color pb-4">
        <h2 className="font-heading text-2xl font-extrabold text-text-primary mb-2">Terms of Service</h2>
        <p className="text-xs font-semibold text-text-secondary">Last updated: July 12, 2026</p>
      </div>

      <div className="flex flex-col gap-4 text-sm text-text-primary leading-relaxed font-medium">
        <section className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-extrabold text-text-primary">1. Acceptable Asset Usage</h3>
          <p className="text-text-secondary">
            Employees are expected to return allocated equipment on or before the expected return date. Booking resources (conference rooms and projectors) is subject to timing schedules and overlap validation.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-extrabold text-text-primary">2. Audit Verifications</h3>
          <p className="text-text-secondary">
            During an open audit cycle, all assigned personnel must accurately report item verification states. Intentionally logging incorrect conditions is a violation of the system terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-extrabold text-text-primary">3. Maintenance and Issues Reporting</h3>
          <p className="text-text-secondary">
            Any equipment issues must be reported promptly via the Maintenance ticket creator. Moving assets between location columns on the Kanban board must represent actual hardware states.
          </p>
        </section>
      </div>
    </div>
  );
}
