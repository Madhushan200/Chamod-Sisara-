'use client';

import React, { useState, useMemo } from 'react';
import { useHotelEngineering } from '@/lib/store';
import { WorkOrder } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { exportReportToExcel, exportReportToPdf } from '@/lib/report-export';
import {
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Printer,
  Filter,
  Building,
  Wrench,
  Search,
  Download,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export const AdminReportGenerator: React.FC = () => {
  const { workOrders, departments, technicians } = useHotelEngineering();
  const { showToast } = useToast();

  // Filter Mode: 'DAY' | 'MONTH' | 'RANGE'
  const [filterMode, setFilterMode] = useState<'DAY' | 'MONTH' | 'RANGE'>('DAY');

  // Single Day
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().slice(0, 10));

  // Month
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Range
  const [rangeStart, setRangeStart] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [rangeEnd, setRangeEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  // Secondary Filters
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Preset Handlers
  const handleSetToday = () => {
    setFilterMode('DAY');
    setSelectedDay(new Date().toISOString().slice(0, 10));
  };

  const handleSetYesterday = () => {
    setFilterMode('DAY');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setSelectedDay(yesterday);
  };

  const handleSetThisMonth = () => {
    setFilterMode('MONTH');
    setSelectedMonth(currentMonthStr);
  };

  // Filter Logic
  const { filteredOrders, dateRangeLabel } = useMemo(() => {
    let label = '';
    let result = workOrders.filter((wo) => {
      const woDate = new Date(wo.reportedAt);
      const woDayStr = wo.reportedAt.slice(0, 10);
      const woMonthStr = wo.reportedAt.slice(0, 7);

      // Date match
      if (filterMode === 'DAY') {
        label = `Date: ${selectedDay}`;
        if (woDayStr !== selectedDay) return false;
      } else if (filterMode === 'MONTH') {
        const [y, m] = selectedMonth.split('-');
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
        label = `Month: ${dateObj.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        if (woMonthStr !== selectedMonth) return false;
      } else if (filterMode === 'RANGE') {
        label = `${rangeStart} to ${rangeEnd}`;
        if (woDayStr < rangeStart || woDayStr > rangeEnd) return false;
      }

      // Department filter
      if (selectedDept !== 'ALL' && wo.departmentName !== selectedDept) return false;

      // Priority filter
      if (selectedPriority !== 'ALL' && wo.priority !== selectedPriority) return false;

      // Status filter
      if (selectedStatus === 'COMPLETED' && wo.status !== 'COMPLETED' && wo.status !== 'CLOSED') return false;
      if (selectedStatus === 'PENDING' && (wo.status === 'COMPLETED' || wo.status === 'CLOSED')) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          wo.workOrderNumber.toLowerCase().includes(q) ||
          wo.title.toLowerCase().includes(q) ||
          wo.location.toLowerCase().includes(q) ||
          (wo.roomNumber && wo.roomNumber.toLowerCase().includes(q)) ||
          wo.departmentName.toLowerCase().includes(q) ||
          wo.category.toLowerCase().includes(q) ||
          (wo.assignedTechnicianName && wo.assignedTechnicianName.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });

    return { filteredOrders: result, dateRangeLabel: label };
  }, [
    workOrders,
    filterMode,
    selectedDay,
    selectedMonth,
    rangeStart,
    rangeEnd,
    selectedDept,
    selectedPriority,
    selectedStatus,
    searchQuery,
  ]);

  // Statistics
  const total = filteredOrders.length;
  const completedCount = filteredOrders.filter((w) => w.status === 'COMPLETED' || w.status === 'CLOSED').length;
  const p1Count = filteredOrders.filter((w) => w.priority === 'P1').length;
  const p2Count = filteredOrders.filter((w) => w.priority === 'P2').length;
  const p3Count = filteredOrders.filter((w) => w.priority === 'P3').length;
  const p4Count = filteredOrders.filter((w) => w.priority === 'P4').length;
  const resolutionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Department counts
  const deptStats = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    filteredOrders.forEach((w) => {
      if (!map[w.departmentName]) map[w.departmentName] = { total: 0, completed: 0 };
      map[w.departmentName].total += 1;
      if (w.status === 'COMPLETED' || w.status === 'CLOSED') {
        map[w.departmentName].completed += 1;
      }
    });
    return Object.entries(map).map(([dept, s]) => ({ dept, ...s }));
  }, [filteredOrders]);

  // Technician workload
  const techStats = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    filteredOrders.forEach((w) => {
      const tech = w.assignedTechnicianName || 'Unassigned';
      if (!map[tech]) map[tech] = { total: 0, completed: 0 };
      map[tech].total += 1;
      if (w.status === 'COMPLETED' || w.status === 'CLOSED') {
        map[tech].completed += 1;
      }
    });
    return Object.entries(map).map(([name, s]) => ({ name, ...s }));
  }, [filteredOrders]);

  // Export Handlers
  const handleExcelExport = () => {
    if (total === 0) {
      showToast('No work orders found for the selected period.', 'warning');
      return;
    }
    exportReportToExcel(filteredOrders, 'Engineering_Operations_Report', dateRangeLabel);
    showToast('Excel report generated and downloaded!', 'success');
  };

  const handlePdfExport = () => {
    if (total === 0) {
      showToast('No work orders found for the selected period.', 'warning');
      return;
    }
    exportReportToPdf(filteredOrders, 'Engineering Operations & Maintenance Report', dateRangeLabel, {
      total,
      completed: completedCount,
      p1Count,
      avgSpeed: '12 mins',
    });
    showToast('PDF report generated and downloaded!', 'success');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Official Management Reports
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Monthly & Date-Wise Maintenance Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter, analyze, and export comprehensive hotel engineering logs for daily shifts or monthly summaries.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExcelExport}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePdfExport}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 1. Date / Month Filter Controls */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('DAY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'DAY' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Single Day
            </button>
            <button
              onClick={() => setFilterMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'MONTH' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗓️ Monthly
            </button>
            <button
              onClick={() => setFilterMode('RANGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'RANGE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Date Range
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSetToday}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleSetYesterday}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
            >
              Yesterday
            </button>
            <button
              onClick={handleSetThisMonth}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
            >
              This Month
            </button>
          </div>
        </div>

        {/* Inputs depending on Filter Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
          {filterMode === 'DAY' && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Select Specific Day</label>
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          )}

          {filterMode === 'MONTH' && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          )}

          {filterMode === 'RANGE' && (
            <>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">From Date</label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">To Date</label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Filter Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="P1">🔴 P1 Emergency</option>
              <option value="P2">🟠 P2 High</option>
              <option value="P3">🟡 P3 Normal</option>
              <option value="P4">🟢 P4 Planned</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Logged</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{total}</div>
          <span className="text-[10px] text-slate-500">{dateRangeLabel}</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Completed / Closed</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{completedCount}</div>
          <span className="text-[10px] text-emerald-600 font-bold">{resolutionRate}% Resolution Rate</span>
        </div>

        <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
          <span className="text-[10px] font-bold text-red-600 uppercase">P1 Emergencies</span>
          <div className="text-2xl font-black text-red-700 mt-0.5">{p1Count}</div>
          <span className="text-[10px] text-red-600">Immediate Response</span>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
          <span className="text-[10px] font-bold text-blue-600 uppercase">P2 High Priority</span>
          <div className="text-2xl font-black text-blue-700 mt-0.5">{p2Count}</div>
          <span className="text-[10px] text-blue-600">Guestroom & Public</span>
        </div>
      </div>

      {/* 3. Department & Technician Workload Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Breakdown */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Department Breakdown</span>
          </h4>
          <div className="space-y-2">
            {deptStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No department records for this period.</p>
            ) : (
              deptStats.map((d) => (
                <div key={d.dept} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="font-bold text-slate-700">{d.dept}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">Total: {d.total}</span>
                    <span className="text-emerald-600 font-bold">Done: {d.completed}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Technician Workload */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Technician Performance</span>
          </h4>
          <div className="space-y-2">
            {techStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No technician assignments for this period.</p>
            ) : (
              techStats.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="font-bold text-slate-700">{t.name}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">Assigned: {t.total}</span>
                    <span className="text-emerald-600 font-bold">Resolved: {t.completed}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Table Preview & Search */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Work Order Records ({total})
          </h4>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search work order # or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">WO #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Room / Loc</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    No work orders found for the selected date filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 50).map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{wo.workOrderNumber}</td>
                    <td className="py-2 px-3 text-slate-500">
                      {new Date(wo.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2 px-3 font-medium">{wo.departmentName}</td>
                    <td className="py-2 px-3">{wo.roomNumber ? `Room ${wo.roomNumber}` : wo.location}</td>
                    <td className="py-2 px-3">
                      <PriorityBadge priority={wo.priority} size="sm" />
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={wo.status} size="sm" />
                    </td>
                    <td className="py-2 px-3 font-medium max-w-xs truncate">{wo.title}</td>
                    <td className="py-2 px-3 text-slate-600">{wo.assignedTechnicianName || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
