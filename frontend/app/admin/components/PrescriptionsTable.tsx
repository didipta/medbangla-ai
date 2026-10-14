"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  User,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  X,
  FileCheck,
  Pill,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Archive,
} from "lucide-react";
import { adminApi, PrescriptionAuditItem } from "../../services/adminApi";

export const PrescriptionsTable: React.FC = () => {
  const [items, setItems] = useState<PrescriptionAuditItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteFilter, setDeleteFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<PrescriptionAuditItem | null>(null);

  // Modal for permanent delete confirmation
  const [itemToDelete, setItemToDelete] = useState<PrescriptionAuditItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPrescriptions(search, statusFilter, deleteFilter, page, 8);
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error("Failed to load prescriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [page, statusFilter, deleteFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPrescriptions();
  };

  // Permanent Delete Action
  const handleConfirmPermanentDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.permanentDeletePrescription(itemToDelete.id);
      setActionMessage(`Prescription ${itemToDelete.id} permanently deleted.`);
      setItemToDelete(null);
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      await fetchPrescriptions();
    } catch (err: any) {
      alert(err.message || "Failed to permanently delete prescription");
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Restore Soft-Deleted Action
  const handleRestore = async (item: PrescriptionAuditItem) => {
    try {
      await adminApi.restorePrescription(item.id);
      setActionMessage(`Prescription ${item.id} restored to active status.`);
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, isDeleted: false, deletedAt: null });
      }
      await fetchPrescriptions();
    } catch (err: any) {
      alert(err.message || "Failed to restore prescription");
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow space-y-6 font-bangla text-[#0F172A]">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-[#0F766E] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#0F766E]" />
            <span>Prescription Audits & History Logs</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
              {totalCount} Total
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            সিস্টেমে স্ক্যানকৃত সকল প্রেসক্রিপশন ও ওষুধের তালিকা — ইউজারদের সফট ডিলিট ও পার্মানেন্ট অ্যাডমিন ডিলিট অপশন
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Rx ID, medicine, user, doctor..."
              className="w-60 sm:w-72 pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Delete Status Filter (All / Active / Soft-Deleted) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
            {[
              { id: "all", label: "All Records" },
              { id: "active", label: "Active" },
              { id: "soft_deleted", label: "Soft-Deleted" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setDeleteFilter(f.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
                  deleteFilter === f.id
                    ? "bg-white text-[#0F766E] shadow-xs border border-teal-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Clinical Risk Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
            {["all", "safe", "moderate", "severe"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-all cursor-pointer text-[11px] ${
                  statusFilter === status
                    ? "bg-white text-[#0F766E] shadow-xs border border-teal-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Prescription & User</th>
              <th className="py-3 px-4">Doctor & Diagnosis</th>
              <th className="py-3 px-4">Medicines (Clean Names)</th>
              <th className="py-3 px-4 text-center">Record Status</th>
              <th className="py-3 px-4 text-center">Safety Triage</th>
              <th className="py-3 px-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-teal-600/30 border-t-[#0F766E] rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">অডিট ডাটা লোড হচ্ছে...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                  কোনো প্রেসক্রিপশন রেকর্ড পাওয়া যায়নি (No matching records found).
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors group ${
                    item.isDeleted ? "bg-rose-50/20" : ""
                  }`}
                >
                  {/* Prescription ID & User Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0F766E]">{item.id}</span>
                      {item.isDeleted && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Soft-Deleted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-bold mt-1">
                      <User className="w-3 h-3 text-[#0F766E]" />
                      <span>{item.userName || "Patient User"}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.userEmail || "patient@medbangla.ai"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>

                  {/* Doctor & Diagnosis */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#0F766E] flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{item.doctorName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5 font-medium">
                      {item.diagnosis}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Patient Code: {item.patientCode}
                    </div>
                  </td>

                  {/* Only Medicine Names Show (Clean Chips) */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                      {item.medicinesList && item.medicinesList.length > 0 ? (
                        item.medicinesList.map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#F0FDFA] text-[#0F766E] text-[11px] font-bold border border-teal-200/90 shadow-2xs"
                          >
                            <Pill className="w-3 h-3 text-[#0F766E]" />
                            <span>{m}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-xs">No medicines extracted</span>
                      )}
                    </div>
                  </td>

                  {/* Soft Delete vs Active Status */}
                  <td className="py-3 px-4 text-center">
                    {item.isDeleted ? (
                      <span className="inline-flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="flex items-center gap-1">
                          <Archive className="w-3 h-3 text-amber-600" />
                          Soft-Deleted by User
                        </span>
                        {item.deletedAt && (
                          <span className="text-[9px] text-amber-600/90 font-mono">
                            {new Date(item.deletedAt).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active Record</span>
                      </span>
                    )}
                  </td>

                  {/* Safety Triage */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.riskLevel === "Severe"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : item.riskLevel === "Moderate"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {item.riskLevel === "Severe" ? (
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                      ) : item.riskLevel === "Moderate" ? (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{item.riskLevel}</span>
                    </span>
                  </td>

                  {/* Actions: Inspect, Restore (if soft deleted), Permanent Delete */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#0F766E] hover:text-white text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer"
                        title="View Full Clinical Audit"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {item.isDeleted && (
                        <button
                          onClick={() => handleRestore(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-[#0F766E] hover:text-white text-[#0F766E] text-xs font-bold transition-all border border-teal-200 shadow-2xs cursor-pointer"
                          title="Restore Soft-Deleted Record"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      )}

                      <button
                        onClick={() => setItemToDelete(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition-all border border-rose-200 shadow-2xs cursor-pointer"
                        title="Permanently Delete Record (Purge from Database)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
          <span className="font-bold text-slate-900">{totalPages}</span> (Total {totalCount} Records)
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

      {/* Inspection Modal Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#0F766E]">
                  Prescription Clinical Audit Details
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-lg font-black text-slate-900 font-mono">
                    ID: <span className="text-[#0F766E]">{selectedItem.id}</span>
                  </h3>
                  {selectedItem.isDeleted && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Soft-Deleted by User
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium">Registered User</span>
                <span className="font-bold text-slate-900 truncate block">{selectedItem.userName}</span>
                <span className="text-[10px] text-slate-400 truncate block">{selectedItem.userEmail}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium">OCR Confidence</span>
                <span className="font-bold text-[#0F766E] font-mono">{selectedItem.ocrConfidence}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium">Triage Status</span>
                <span
                  className={`font-bold ${
                    selectedItem.riskLevel === "Severe"
                      ? "text-rose-600"
                      : selectedItem.riskLevel === "Moderate"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedItem.riskLevel}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium">Total Meds</span>
                <span className="font-bold text-slate-900">{selectedItem.medicinesCount} Recognized</span>
              </div>
            </div>

            {/* Clinical Information */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                <span>Prescribing Physician:</span>
                <span className="font-bold text-slate-900">{selectedItem.doctorName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <FileCheck className="w-4 h-4 text-[#0F766E]" />
                <span>Clinical Diagnosis:</span>
                <span className="font-bold text-slate-900">{selectedItem.diagnosis}</span>
              </div>
            </div>

            {/* Extracted Medicines List (Only Medicine Names) */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-[#0F766E]" />
                <span>Extracted Medication Names</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedItem.medicinesList.map((med, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0FDFA] border border-teal-200/80 text-xs"
                  >
                    <span className="font-bold text-slate-900">{med}</span>
                    <span className="text-[10px] text-[#0F766E] bg-white px-2 py-0.5 rounded font-bold border border-teal-200">
                      Clean Drug Name
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                {selectedItem.isDeleted ? (
                  <button
                    onClick={() => handleRestore(selectedItem)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-[#0F766E] hover:text-white text-xs font-bold text-[#0F766E] border border-teal-200 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore to Active</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setItemToDelete(selectedItem);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-xs font-bold text-rose-700 border border-rose-200 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Permanent Delete</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Permanently Delete Prescription?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                This will permanently remove prescription record{" "}
                <span className="font-mono font-bold text-slate-800">{itemToDelete.id}</span> from the database.
                This action cannot be undone.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>User:</span>
                <span className="font-bold text-slate-900">{itemToDelete.userName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Extracted Meds:</span>
                <span className="font-bold text-slate-900">{itemToDelete.medicinesList.join(", ") || "None"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
