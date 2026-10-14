"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  FileText,
  Clock,
  Shield,
  Stethoscope,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { adminApi, RegisteredUserItem } from "../../services/adminApi";

export const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<RegisteredUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(search, roleFilter, page, 10);
      setUsers(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error("Failed to load users directory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow space-y-6 font-bangla text-[#0F172A]">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0F766E]" />
            <span>Registered Users & Patient Directory</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
              {totalCount} Users
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            সিস্টেমে নিবন্ধিত সকল রোগী, চিকিৎসক ও অ্যাডমিন অ্যাকাউন্টের অ্যাক্টিভিটি তালিকা
          </p>
        </div>

        {/* Search & Role Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or BMDC..."
              className="w-60 sm:w-72 pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
            {["all", "patient", "doctor", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoleFilter(r);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg capitalize font-bold transition-all cursor-pointer text-[11px] ${
                  roleFilter === r
                    ? "bg-white text-[#0F766E] shadow-xs border border-teal-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">User Details</th>
              <th className="py-3 px-4">Role & Verification</th>
              <th className="py-3 px-4 text-center">Prescriptions Scanned</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-teal-600/30 border-t-[#0F766E] rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">ইউজার তালিকা লোড হচ্ছে...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                  কোনো ইউজার রেকর্ড পাওয়া যায়নি (No matching users found).
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* User Profile */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-bold flex items-center justify-center text-xs shadow-2xs flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === "doctor"
                            ? "bg-teal-50 text-[#0F766E] border border-teal-200"
                            : u.role === "admin"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {u.role === "doctor" ? (
                          <Stethoscope className="w-3 h-3 text-[#0F766E]" />
                        ) : u.role === "admin" ? (
                          <Shield className="w-3 h-3 text-purple-600" />
                        ) : (
                          <User className="w-3 h-3 text-slate-600" />
                        )}
                        <span className="capitalize">{u.role}</span>
                      </span>

                      {u.bmdcNumber && (
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50/60 px-2 py-0.5 rounded border border-teal-200/50">
                          BMDC: {u.bmdcNumber}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Total Prescriptions Scanned */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
                      <FileText className="w-3 h-3 text-[#0F766E]" />
                      <span>{u.prescriptionCount}</span>
                    </span>
                  </td>

                  {/* Joined & Last Active */}
                  <td className="py-3 px-4">
                    <div className="text-slate-700 font-medium">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active Member"}
                    </div>
                    {u.lastLoginAt && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Active: {new Date(u.lastLoginAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <UserX className="w-3 h-3 text-slate-500" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500 font-medium">
        <div>
          Showing Page <span className="font-bold text-slate-900">{page}</span> of{" "}
          <span className="font-bold text-slate-900">{totalPages}</span> (Total {totalCount} Users)
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
