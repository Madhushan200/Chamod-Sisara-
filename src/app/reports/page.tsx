'use client';

import React from 'react';
import { AdminReportGenerator } from '@/components/admin/AdminReportGenerator';

export default function ReportsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      <AdminReportGenerator />
    </div>
  );
}
