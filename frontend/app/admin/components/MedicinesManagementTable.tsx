"use client";

import React, { useState, useEffect } from "react";
import {
  Pill,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  ShieldAlert,
  Building2,
  Tag,
  DollarSign,
} from "lucide-react";
import { adminApi, MedicineItem } from "../../services/adminApi";

export const MedicinesManagementTable: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<MedicineItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    brand_name: "",
    generic_name: "",
    strength: "",
    form: "Tablet",
    manufacturer: "",
    price: "0.00",
    packsize: "10's pack",
    indication: "",
    dose: "",
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMedicines(search, page, 10);
      setMedicines(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error("Failed to load medicines directory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMedicines();
  };

  const handleOpenAdd = () => {
    setFormData({
      brand_name: "",
      generic_name: "",
      strength: "",
      form: "Tablet",
      manufacturer: "",
      price: "10.00",
      packsize: "10's pack",
      indication: "General clinical use",
      dose: "As directed by physician",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med: MedicineItem) => {
    setEditingMedicine(med);
    setFormData({
      brand_name: med.brand_name || "",
      generic_name: med.generic_name || "",
      strength: med.strength || "",
      form: med.form || "Tablet",
      manufacturer: med.manufacturer || "",
      price: med.price || "0.00",
      packsize: med.packsize || "10's pack",
      indication: med.indication || "General clinical use",
      dose: med.dose || "As directed by physician",
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand_name.trim() || !formData.generic_name.trim()) {
      alert("Brand Name and Generic Name are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.addMedicine(formData);
      setActionMessage(`Medicine '${formData.brand_name}' added successfully!`);
      setIsAddModalOpen(false);
      await fetchMedicines();
    } catch (err: any) {
      alert(err.message || "Failed to add medicine");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateMedicine(editingMedicine.brand_id, formData);
      setActionMessage(`Medicine '${formData.brand_name}' updated successfully!`);
      setEditingMedicine(null);
      await fetchMedicines();
    } catch (err: any) {
      alert(err.message || "Failed to update medicine");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMedicine) return;
    setIsSubmitting(true);
    try {
      await adminApi.deleteMedicine(deletingMedicine.brand_id);
      setActionMessage(`Medicine '${deletingMedicine.brand_name}' deleted from catalog.`);
      setDeletingMedicine(null);
      await fetchMedicines();
    } catch (err: any) {
      alert(err.message || "Failed to delete medicine");
    } finally {
      setIsSubmitting(false);
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

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#0F766E]" />
            <span>Medicine Catalog Management</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
              {totalCount} Formulations
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            ঔষধের ডাটাবেজ ব্রাউজ করুন, নতুন ঔষধ যুক্ত করুন, সংশোধন অথবা মুছে ফেলুন (CRUD)
          </p>
        </div>

        {/* Search & Add Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, generic, or manufacturer..."
              className="w-60 sm:w-72 pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Brand & Form</th>
              <th className="py-3 px-4">Generic Composition</th>
              <th className="py-3 px-4">Manufacturer</th>
              <th className="py-3 px-4">Price & Pack</th>
              <th className="py-3 px-4 text-right">Catalog Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-teal-600/30 border-t-[#0F766E] rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">ঔষধের তালিকা লোড হচ্ছে...</span>
                  </div>
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                  কোনো ঔষধ পাওয়া যায়নি (No matching medicines found).
                </td>
              </tr>
            ) : (
              medicines.map((m) => (
                <tr key={m.brand_id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Brand & Form */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-[#0F766E]">{m.brand_name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
                        {m.form || "Tablet"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Strength: {m.strength || "N/A"}
                    </div>
                  </td>

                  {/* Generic Name */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{m.generic_name}</span>
                    </div>
                    {m.indication && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                        {m.indication}
                      </div>
                    )}
                  </td>

                  {/* Manufacturer */}
                  <td className="py-3 px-4">
                    <div className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#0F766E]" />
                      <span>{m.manufacturer || "Pharmaceuticals Ltd."}</span>
                    </div>
                  </td>

                  {/* Price & Pack Size */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">
                      ৳{m.price || "0.00"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {m.packsize || "10's pack"}
                    </div>
                  </td>

                  {/* Actions: Edit, Delete */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#0F766E] hover:text-white text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer"
                        title="Edit Medicine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeletingMedicine(m)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition-all border border-rose-200 shadow-2xs cursor-pointer"
                        title="Delete Medicine from Catalog"
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
          <span className="font-bold text-slate-900">{totalPages}</span> (Total {totalCount} Formulations)
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

      {/* Add / Edit Medicine Modal */}
      {(isAddModalOpen || editingMedicine) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] border border-teal-200 flex items-center justify-center text-[#0F766E]">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isAddModalOpen ? "Add New Medicine" : "Edit Medicine Details"}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {isAddModalOpen ? "Register formulation in MedBangla clinical catalog" : `Updating Brand ID: ${editingMedicine?.brand_id}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMedicine(null);
                }}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    placeholder="e.g. Napa Extra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.generic_name}
                    onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                    placeholder="e.g. Paracetamol + Caffeine"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Strength</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g. 500mg + 65mg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Dosage Form</label>
                  <select
                    value={formData.form}
                    onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Injection">Injection</option>
                    <option value="Eye Drops">Eye Drops</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Unit Price (BDT)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 2.50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Beximco Pharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={formData.packsize}
                    onChange={(e) => setFormData({ ...formData, packsize: e.target.value })}
                    placeholder="e.g. 10 x 10's pack"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Clinical Indication</label>
                <input
                  type="text"
                  value={formData.indication}
                  onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                  placeholder="e.g. Fever, headache, mild to moderate pain"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMedicine(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isAddModalOpen ? "Create Formulation" : "Save Changes"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Delete Medicine from Catalog?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-800">
                  {deletingMedicine.brand_name} ({deletingMedicine.strength})
                </span>
                ? This will remove it from the searchable DGDA medicine directory.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMedicine(null)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
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
