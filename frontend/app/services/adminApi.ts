/**
 * MedBangla AI - Clinical Administrator API Client
 * ================================================
 * Handles authentication, KPI metrics, prescription audit logs,
 * drug interaction matrix, and infrastructure telemetry.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ADMIN_TOKEN_KEY = "medbangla_admin_jwt";

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

  // 1. Admin Login
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid administrator credentials");
    }

    const data: AdminLoginResponse = await res.json();
    this.setToken(data.access_token);
    this.setAdminProfile(data.admin);
    return data;
  }

  // 2. Verify Session
  async getMe(): Promise<{ status: string; admin: AdminUser }> {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats?range_days=${rangeDays}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to load clinical analytics");
    }
    const json = await res.json();
    return json.data;
  }

  // 4. Prescriptions Audit Table (Soft delete support + only medicine names)
  async getPrescriptions(
    search?: string,
    statusFilter: string = "all",
    deleteStatus: string = "all",
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ items: PrescriptionAuditItem[]; totalCount: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      status_filter: statusFilter,
      delete_status: deleteStatus,
    });
    if (search) {
      params.append("search", search);
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/prescriptions?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to load prescription audit logs");
    }
    const json = await res.json();
    return json.data;
  }

  // 4a. Permanent Delete Prescription (Admin only)
  async permanentDeletePrescription(historyId: string): Promise<{ status: string; message: string }> {
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
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      role: role,
    });
    if (search) {
      params.append("search", search);
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/users?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to load user directory");
    }
    const json = await res.json();
    return json.data;
  }

  // 6. Medicine Directory Management (Catalog CRUD)
  async getMedicines(
    search?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ items: MedicineItem[]; totalCount: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search) {
      params.append("search", search);
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/medicines?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to load medicines directory");
    }
    const json = await res.json();
    return json.data;
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
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/interactions?severity=${severity}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to load drug interaction safety matrix");
    }
    const json = await res.json();
    return json.data;
  }

  // 8. System & Infrastructure Diagnostics
  async getSystemDiagnostics(): Promise<{ environment: string; version: string; serverTime: string; services: SystemServiceItem[] }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/system`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to load system diagnostics");
    }
    const json = await res.json();
    return json.data;
  }

  // 9. Clear & Reload Cache
  async clearCache(): Promise<{ message: string; indexedChunks: number; cachedMonographs: number }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/clear-cache`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to reload clinical cache");
    }
    return res.json();
  }
}

export const adminApi = new AdminApiClient();
