/**
 * MedBangla AI - Clinical Administrator API Client
 * ================================================
 * Handles authentication, KPI metrics, prescription audit logs,
 * drug interaction matrix, infrastructure telemetry, and full
 * simulated Demo Mode with rich localized datasets.
 */

import {
  DEMO_ADMIN_USER,
  INITIAL_MOCK_STATS,
  INITIAL_MOCK_INTERACTIONS,
  INITIAL_MOCK_SYSTEM_DIAGNOSTICS,
  getStoredDemoPrescriptions,
  saveStoredDemoPrescriptions,
  getStoredDemoMedicines,
  saveStoredDemoMedicines,
  getStoredDemoUsers,
  resetAllDemoData,
} from "./adminMockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ADMIN_TOKEN_KEY = "medbangla_admin_jwt";
const ADMIN_IS_DEMO_KEY = "medbangla_admin_is_demo";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: string;
  last_login?: string;
}

export interface AdminLoginResponse {
  status: string;
  access_token: string;
  token_type: string;
  admin: AdminUser;
}

export interface MetricSummary {
  totalPrescriptions: number;
  totalMedicinesAnalyzed: number;
  flaggedAlerts: number;
  criticalInteractions: number;
  safePrescriptions: number;
  overallOcrAccuracy: number;
  activeUsers: number;
  dgdaMonographsIndexed: number;
  averageProcessingTimeSec: number;
}

export interface TimelineDataPoint {
  date: string;
  fullDate: string;
  scans: number;
  safe: number;
  flagged: number;
  ocrAccuracy: number;
  aiLatencyMs: number;
}

export interface TopMedicine {
  generic: string;
  brandExample: string;
  prescriptions: number;
  percentage: number;
  riskLevel: "Low" | "Moderate" | "Severe";
  category: string;
}

export interface SeverityItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AIEngineItem {
  engine: string;
  usagePct: number;
  avgLatencyMs: number;
  status: string;
}

export interface AdminStatsResponse {
  summary: MetricSummary;
  timeline: TimelineDataPoint[];
  topMedicines: TopMedicine[];
  severityBreakdown: SeverityItem[];
  aiEngines: AIEngineItem[];
  generatedAt: string;
}

export interface PrescriptionAuditItem {
  id: string;
  timestamp: string;
  patientCode: string;
  userName?: string;
  userEmail?: string;
  doctorName: string;
  diagnosis: string;
  medicinesCount: number;
  medicinesList: string[]; // Clean medicine names only
  ocrConfidence: number;
  riskLevel: "Safe" | "Moderate" | "Severe";
  status: "Clear" | "Flagged";
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface RegisteredUserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  bmdcNumber?: string | null;
  title?: string | null;
  picture?: string | null;
  isActive: boolean;
  prescriptionCount: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface MedicineItem {
  brand_id: number;
  brand_name: string;
  generic_name: string;
  strength: string;
  form: string;
  manufacturer: string;
  price?: string;
  packsize?: string;
  indication?: string;
  dose?: string;
}

export interface InteractionMatrixItem {
  id: string;
  drugA: string;
  drugB: string;
  severity: "Severe" | "Moderate" | "Minor";
  dgdaWarning: string;
  mechanism: string;
  clinicalRecommendation: string;
  detectedCount: number;
  lastFlagged: string;
}

export interface SystemServiceItem {
  name: string;
  status: string;
  latencyMs?: number;
  type: string;
  runtime?: string;
  indexedChunks?: number;
  cachedMonographs?: number;
}

class AdminApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  }

  public getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
  }

  public removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem("medbangla_admin_profile");
      localStorage.removeItem(ADMIN_IS_DEMO_KEY);
    }
  }

  public setAdminProfile(admin: AdminUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("medbangla_admin_profile", JSON.stringify(admin));
    }
  }

  public getAdminProfile(): AdminUser | null {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("medbangla_admin_profile");
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Checks whether the current admin session is in Demo Mode
   */
  public isDemoMode(): boolean {
    if (typeof window !== "undefined") {
      const isDemoFlag = localStorage.getItem(ADMIN_IS_DEMO_KEY);
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      return isDemoFlag === "true" || token === "demo-admin-jwt-token";
    }
    return false;
  }

  /**
   * 1-Click Demo Login: Establishes a sandbox Demo Admin session
   */
  public async loginDemo(): Promise<AdminLoginResponse> {
    const response: AdminLoginResponse = {
      status: "success",
      access_token: "demo-admin-jwt-token",
      token_type: "bearer",
      admin: {
        ...DEMO_ADMIN_USER,
        last_login: new Date().toISOString(),
      },
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_IS_DEMO_KEY, "true");
      this.setToken(response.access_token);
      this.setAdminProfile(response.admin);
    }

    return response;
  }

  /**
   * Reset all mock data to the pristine initial state
   */
  public resetDemoData(): void {
    resetAllDemoData();
  }

  // 1. Admin Login (Supports both Real Backend & Instant Demo)
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check if demo credentials are supplied
    if (
      cleanEmail === "demo@medbangla.ai" ||
      cleanEmail.includes("demo") ||
      cleanPass === "demoadmin123"
    ) {
      return this.loginDemo();
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid administrator credentials");
      }

      const data: AdminLoginResponse = await res.json();
      if (typeof window !== "undefined") {
        localStorage.removeItem(ADMIN_IS_DEMO_KEY);
      }
      this.setToken(data.access_token);
      this.setAdminProfile(data.admin);
      return data;
    } catch (err: unknown) {
      // If backend is unreachable or refused connection, notify user cleanly
      const msg = err instanceof Error ? err.message : "Authentication service error";
      throw new Error(msg);
    }
  }

  // 2. Verify Session
  async getMe(): Promise<{ status: string; admin: AdminUser }> {
    if (this.isDemoMode()) {
      return {
        status: "success",
        admin: this.getAdminProfile() || DEMO_ADMIN_USER,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Admin session expired or unauthorized");
    }
    return res.json();
  }

  // 3. Analytics & KPI Charts
  async getStats(rangeDays: number = 14): Promise<AdminStatsResponse> {
    if (this.isDemoMode()) {
      // Simulated small latency for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 80));
      return {
        ...INITIAL_MOCK_STATS,
        generatedAt: new Date().toISOString(),
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats?range_days=${rangeDays}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load clinical analytics");
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      // Fallback in case of backend hiccup
      console.warn("Falling back to demo stats:", err);
      return INITIAL_MOCK_STATS;
    }
  }

  // 4. Prescriptions Audit Table (Soft delete support + filtering)
  async getPrescriptions(
    search?: string,
    statusFilter: string = "all",
    deleteStatus: string = "all",
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ items: PrescriptionAuditItem[]; totalCount: number; page: number; totalPages: number }> {
    if (this.isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      let allItems = getStoredDemoPrescriptions();

      // Filter by deletion state
      if (deleteStatus === "active") {
        allItems = allItems.filter((item) => !item.isDeleted);
      } else if (deleteStatus === "deleted") {
        allItems = allItems.filter((item) => item.isDeleted);
      }

      // Filter by safety risk status
      if (statusFilter && statusFilter !== "all") {
        const filterLower = statusFilter.toLowerCase();
        allItems = allItems.filter((item) => {
          if (filterLower === "flagged") return item.status === "Flagged";
          if (filterLower === "clear" || filterLower === "safe") return item.status === "Clear" || item.riskLevel === "Safe";
          if (filterLower === "moderate") return item.riskLevel === "Moderate";
          if (filterLower === "severe") return item.riskLevel === "Severe";
          return true;
        });
      }

      // Filter by search query
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        allItems = allItems.filter(
          (item) =>
            item.id.toLowerCase().includes(q) ||
            item.patientCode.toLowerCase().includes(q) ||
            (item.userName && item.userName.toLowerCase().includes(q)) ||
            (item.userEmail && item.userEmail.toLowerCase().includes(q)) ||
            item.doctorName.toLowerCase().includes(q) ||
            item.diagnosis.toLowerCase().includes(q) ||
            item.medicinesList.some((m) => m.toLowerCase().includes(q))
        );
      }

      const totalCount = allItems.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startIndex = (page - 1) * pageSize;
      const items = allItems.slice(startIndex, startIndex + pageSize);

      return { items, totalCount, page, totalPages };
    }

    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      status_filter: statusFilter,
      delete_status: deleteStatus,
    });
    if (search) {
      params.append("search", search);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/prescriptions?${params.toString()}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load prescription audit logs");
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend error, serving demo prescriptions:", err);
      const allItems = getStoredDemoPrescriptions();
      return {
        items: allItems.slice(0, pageSize),
        totalCount: allItems.length,
        page: 1,
        totalPages: Math.ceil(allItems.length / pageSize),
      };
    }
  }

  // 4a. Permanent Delete Prescription (Admin only)
  async permanentDeletePrescription(historyId: string): Promise<{ status: string; message: string }> {
    if (this.isDemoMode()) {
      const items = getStoredDemoPrescriptions();
      const filtered = items.filter((item) => item.id !== historyId);
      saveStoredDemoPrescriptions(filtered);
      return { status: "success", message: `Demo: Prescription ${historyId} permanently removed from simulated records.` };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/prescriptions/${historyId}/permanent`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to permanently delete prescription");
    }
    return res.json();
  }

  // 4b. Restore Soft-Deleted Prescription (Admin only)
  async restorePrescription(historyId: string): Promise<{ status: string; message: string }> {
    if (this.isDemoMode()) {
      const items = getStoredDemoPrescriptions();
      const updated = items.map((item) => {
        if (item.id === historyId) {
          return { ...item, isDeleted: false, deletedAt: null };
        }
        return item;
      });
      saveStoredDemoPrescriptions(updated);
      return { status: "success", message: `Demo: Prescription ${historyId} successfully restored to active records.` };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/prescriptions/${historyId}/restore`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to restore prescription");
    }
    return res.json();
  }

  // 5. User Directory
  async getUsers(
    search?: string,
    role: string = "all",
    page: number = 1,
    pageSize: number = 15
  ): Promise<{ items: RegisteredUserItem[]; totalCount: number; page: number; totalPages: number }> {
    if (this.isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      let allUsers = getStoredDemoUsers();

      // Filter by role
      if (role && role !== "all") {
        allUsers = allUsers.filter((u) => u.role.toLowerCase() === role.toLowerCase());
      }

      // Filter by search query
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        allUsers = allUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.bmdcNumber && u.bmdcNumber.toLowerCase().includes(q)) ||
            (u.title && u.title.toLowerCase().includes(q))
        );
      }

      const totalCount = allUsers.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startIndex = (page - 1) * pageSize;
      const items = allUsers.slice(startIndex, startIndex + pageSize);

      return { items, totalCount, page, totalPages };
    }

    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      role: role,
    });
    if (search) {
      params.append("search", search);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users?${params.toString()}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load user directory");
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend error, serving demo users:", err);
      const allUsers = getStoredDemoUsers();
      return {
        items: allUsers.slice(0, pageSize),
        totalCount: allUsers.length,
        page: 1,
        totalPages: Math.ceil(allUsers.length / pageSize),
      };
    }
  }

  // 6. Medicine Directory Management (Catalog CRUD)
  async getMedicines(
    search?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ items: MedicineItem[]; totalCount: number; page: number; totalPages: number }> {
    if (this.isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      let allMeds = getStoredDemoMedicines();

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        allMeds = allMeds.filter(
          (m) =>
            m.brand_name.toLowerCase().includes(q) ||
            m.generic_name.toLowerCase().includes(q) ||
            m.manufacturer.toLowerCase().includes(q) ||
            m.strength.toLowerCase().includes(q) ||
            (m.indication && m.indication.toLowerCase().includes(q))
        );
      }

      const totalCount = allMeds.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startIndex = (page - 1) * pageSize;
      const items = allMeds.slice(startIndex, startIndex + pageSize);

      return { items, totalCount, page, totalPages };
    }

    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search) {
      params.append("search", search);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/medicines?${params.toString()}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load medicines directory");
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend error, serving demo medicines:", err);
      const allMeds = getStoredDemoMedicines();
      return {
        items: allMeds.slice(0, pageSize),
        totalCount: allMeds.length,
        page: 1,
        totalPages: Math.ceil(allMeds.length / pageSize),
      };
    }
  }

  async addMedicine(payload: {
    brand_name: string;
    generic_name: string;
    strength: string;
    form?: string;
    manufacturer: string;
    price?: string;
    packsize?: string;
    indication?: string;
    dose?: string;
  }): Promise<{ status: string; message: string; data: MedicineItem }> {
    if (this.isDemoMode()) {
      const allMeds = getStoredDemoMedicines();
      const newMed: MedicineItem = {
        brand_id: Date.now(),
        brand_name: payload.brand_name.trim(),
        generic_name: payload.generic_name.trim(),
        strength: payload.strength.trim(),
        form: payload.form || "Tablet",
        manufacturer: payload.manufacturer.trim(),
        price: payload.price || "0.00",
        packsize: payload.packsize || "10's pack",
        indication: payload.indication || "General indication",
        dose: payload.dose || "As directed by physician",
      };

      const updated = [newMed, ...allMeds];
      saveStoredDemoMedicines(updated);
      return {
        status: "success",
        message: `Demo: "${newMed.brand_name}" successfully added to local simulated catalog.`,
        data: newMed,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/medicines`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to add medicine");
    }
    return res.json();
  }

  async updateMedicine(
    brandId: number,
    payload: Partial<{
      brand_name: string;
      generic_name: string;
      strength: string;
      form: string;
      manufacturer: string;
      price: string;
      packsize: string;
      indication: string;
      dose: string;
    }>
  ): Promise<{ status: string; message: string; data: MedicineItem }> {
    if (this.isDemoMode()) {
      const allMeds = getStoredDemoMedicines();
      let updatedMed: MedicineItem | null = null;
      const updated = allMeds.map((m) => {
        if (m.brand_id === brandId) {
          updatedMed = { ...m, ...payload };
          return updatedMed;
        }
        return m;
      });

      if (!updatedMed) {
        throw new Error("Medicine not found in demo catalog");
      }

      saveStoredDemoMedicines(updated);
      return {
        status: "success",
        message: `Demo: Formulation ${brandId} successfully updated.`,
        data: updatedMed,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/medicines/${brandId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update medicine");
    }
    return res.json();
  }

  async deleteMedicine(brandId: number): Promise<{ status: string; message: string; brand_id: number }> {
    if (this.isDemoMode()) {
      const allMeds = getStoredDemoMedicines();
      const filtered = allMeds.filter((m) => m.brand_id !== brandId);
      saveStoredDemoMedicines(filtered);
      return {
        status: "success",
        message: `Demo: Medicine formulation ${brandId} deleted from simulated catalog.`,
        brand_id: brandId,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/medicines/${brandId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to delete medicine");
    }
    return res.json();
  }

  // 7. Drug Interactions Matrix
  async getInteractions(severity: string = "all"): Promise<{ totalTrackedPairs: number; interactions: InteractionMatrixItem[] }> {
    if (this.isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      let list = INITIAL_MOCK_INTERACTIONS;
      if (severity && severity !== "all") {
        list = list.filter((item) => item.severity.toLowerCase() === severity.toLowerCase());
      }
      return {
        totalTrackedPairs: INITIAL_MOCK_INTERACTIONS.length,
        interactions: list,
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/interactions?severity=${severity}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load drug interaction safety matrix");
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend error, serving demo interactions:", err);
      let list = INITIAL_MOCK_INTERACTIONS;
      if (severity && severity !== "all") {
        list = list.filter((item) => item.severity.toLowerCase() === severity.toLowerCase());
      }
      return {
        totalTrackedPairs: INITIAL_MOCK_INTERACTIONS.length,
        interactions: list,
      };
    }
  }

  // 8. System & Infrastructure Diagnostics
  async getSystemDiagnostics(): Promise<{ environment: string; version: string; serverTime: string; services: SystemServiceItem[] }> {
    if (this.isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 70));
      return {
        ...INITIAL_MOCK_SYSTEM_DIAGNOSTICS,
        serverTime: new Date().toISOString(),
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/system`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load system diagnostics");
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend error, serving demo system diagnostics:", err);
      return {
        ...INITIAL_MOCK_SYSTEM_DIAGNOSTICS,
        serverTime: new Date().toISOString(),
      };
    }
  }

  // 9. Clear & Reload Cache
  async clearCache(): Promise<{ message: string; indexedChunks: number; cachedMonographs: number }> {
    if (this.isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        message: "Clinical cache flushed and successfully refreshed in sandbox memory",
        indexedChunks: 18450,
        cachedMonographs: 18450,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/clear-cache`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to reload clinical cache");
    }
    return res.json();
  }

  // 10. App Control, Maintenance & Update Settings
  async getAppControl(): Promise<AppControlData> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/app-control`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (typeof window !== "undefined") {
            localStorage.setItem("medbangla_demo_app_control", JSON.stringify(json.data));
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Backend error in getAppControl, falling back to local cache:", err);
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medbangla_demo_app_control");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return { ...DEFAULT_DEMO_APP_CONTROL };
  }

  async updateAppControl(payload: Partial<AppControlData>): Promise<AppControlData> {
    // 1. Always attempt live sync to backend so Flutter mobile apps receive the update
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/app-control`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("medbangla_demo_app_control", JSON.stringify(json.data));
        }
        return json.data;
      }
    } catch (err) {
      console.warn("Backend unreachable during updateAppControl, updating local cache:", err);
    }

    // 2. Fallback to local persistence if backend is offline
    const current = await this.getAppControl();
    const updated: AppControlData = {
      ...current,
      ...payload,
      updated_at: new Date().toISOString(),
    };
    if (payload.apk_google_drive_url) {
      const driveMatch = payload.apk_google_drive_url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        updated.apk_direct_download_url = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      }
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("medbangla_demo_app_control", JSON.stringify(updated));
    }
    return updated;
  }

  async testDriveLink(driveUrl: string): Promise<{ file_id: string | null; direct_download_url: string; is_google_drive: boolean }> {
    if (this.isDemoMode()) {
      const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      const fileId = match ? match[1] : "demo-drive-id-12345";
      return {
        file_id: fileId,
        direct_download_url: `https://drive.google.com/uc?export=download&id=${fileId}`,
        is_google_drive: true,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/app-control/test-drive-link`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ drive_url: driveUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid Google Drive link");
    }
    return res.json();
  }
}

export interface AppControlData {
  id?: string;
  is_maintenance_mode: boolean;
  maintenance_title: string;
  maintenance_message: string;
  maintenance_eta: string;
  emergency_contact: string;
  latest_version: string;
  latest_version_code: number;
  min_supported_version: string;
  min_supported_version_code: number;
  is_force_update: boolean;
  update_title: string;
  update_notes: string;
  apk_google_drive_url: string;
  apk_direct_download_url: string;
  apk_file_size: string;
  updated_at?: string;
}

const DEFAULT_DEMO_APP_CONTROL: AppControlData = {
  is_maintenance_mode: false,
  maintenance_title: "মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে",
  maintenance_message: "আমাদের ক্লিনিক্যাল ড্রাগ ডাটাবেজ এবং এআই সার্ভারের নিয়মিত উন্নয়ন কাজ চলছে। কিছুক্ষণের মধ্যে সেবা পুনরায় চালু হবে। সাময়িক অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।",
  maintenance_eta: "৩০ মিনিট",
  emergency_contact: "support@medbangla.ai",
  latest_version: "1.0.0",
  latest_version_code: 1,
  min_supported_version: "1.0.0",
  min_supported_version_code: 1,
  is_force_update: false,
  update_title: "মেডবাংলা এআই এর নতুন সংস্করণ উপলব্ধ",
  update_notes: "• প্রেসক্রিপশন ওসিআর স্ক্যানার অপ্টিমাইজেশন\n• ডিজিডিএ ১৭,৫৮৯+ ঔষধের সর্বশেষ মূল্য ও ডাটাবেজ যুক্ত\n• ড্রাগ-ড্রাগ ইন্টারেকশন ও ড্রাগ অ্যালার্জি সেফটি এলার্ট আপডেট\n• বাগ ফিক্স এবং দ্রুততর পারফরম্যান্স",
  apk_google_drive_url: "https://drive.google.com/file/d/1DemoGoogleDriveApkFileIdMedBangla2026/view?usp=sharing",
  apk_direct_download_url: "https://drive.google.com/uc?export=download&id=1DemoGoogleDriveApkFileIdMedBangla2026",
  apk_file_size: "24.8 MB",
  updated_at: new Date().toISOString(),
};

export const adminApi = new AdminApiClient();
