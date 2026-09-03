"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  accessor?: (item: T) => React.ReactNode;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T | ((item: T) => string);
  searchPlaceholder?: string;
  itemsPerPage?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string;
  headerAction?: React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  itemsPerPage = 10,
  emptyTitle = "No records found",
  emptyDescription,
  emptyMessage,
  headerAction,
  isLoading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const displayEmptyDesc = emptyMessage || emptyDescription || "There are no entries matching your query.";

  // Filter Data
  const filteredData = data.filter((item) => {
    if (!search) return true;
    const query = search.toLowerCase();

    if (typeof searchKey === "function") {
      return searchKey(item).toLowerCase().includes(query);
    } else if (searchKey && item[searchKey]) {
      return String(item[searchKey]).toLowerCase().includes(query);
    }

    // Default search across all primitive values
    return Object.values(item as any).some((val) =>
      typeof val === "string" || typeof val === "number" ? String(val).toLowerCase().includes(query) : false
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading data records...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-4 text-slate-700 ${col.className || ""}`}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessor
                        ? col.accessor(item)
                        : col.accessorKey
                        ? (item[col.accessorKey] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-navy-900 mb-1">{emptyTitle}</h4>
                    <p className="text-xs text-slate-500">{displayEmptyDesc}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > itemsPerPage && (
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong className="text-slate-700">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </strong>{" "}
            of <strong className="text-slate-700">{filteredData.length}</strong> results
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
