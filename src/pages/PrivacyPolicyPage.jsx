import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white border border-border-color rounded-2xl p-8 shadow-sm max-w-4xl mx-auto flex flex-col gap-6">
      <div className="border-b border-border-color pb-4">
        <h2 className="font-heading text-2xl font-extrabold text-text-primary mb-2">Privacy Policy</h2>
        <p className="text-xs font-semibold text-text-secondary">Last updated: July 12, 2026</p>
      </div>

      <div className="flex flex-col gap-4 text-sm text-text-primary leading-relaxed font-medium">
        <section className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-extrabold text-text-primary">1. Information Collection</h3>
          <p className="text-text-secondary">
            AssetFlow collects employee data (name, email, and department) and audit log details solely to administer and secure corporate assets. We track bookings, allocation timelines, and repair requests to maintain operation reports.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-extrabold text-text-primary">2. Security and Data Protection</h3>
          <p className="text-text-secondary">
            All database connections are encrypted over HTTPS. Access permissions are strictly isolated by roles (e.g. Employee vs. Admin) to prevent unauthorized transfers or data access.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-extrabold text-text-primary">3. Information Sharing</h3>
          <p className="text-text-secondary">
            AssetFlow does not sell or share business asset allocation data with outside advertisers or third-party organizations.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-extrabold text-text-primary">4. Contact Information</h3>
          <p className="text-text-secondary">
            For questions regarding resource booking logs or RLS policies, contact the administrator team at support@assetflow-corp.com.
          </p>
        </section>
      </div>
    </div>
  );
}
