/**
 * MedBangla AI - Frontend API Service Client
 */

import {
  SystemHealth,
  MedicineSearchResult,
  MedicineDetails,
  InteractionReport,
  ChatResponse,
  PrescriptionExplainResponse,
  OCRAnalysisResponse,
} from "../types/api";

export const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getBaseApiUrl(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("medbangla_api_url") || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export function setBaseApiUrl(url: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("medbangla_api_url", url);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<{ data: T; durationMs: number; reqId?: string }> {
  const baseUrl = getBaseApiUrl();
  const url = `${baseUrl}${path}`;
  const t0 = performance.now();

  const token = typeof window !== "undefined" ? localStorage.getItem("medbangla_token") : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const durationMs = Math.round(performance.now() - t0);
    const reqId = res.headers.get("X-Request-ID") || undefined;

    if (!res.ok) {
      let errorBody: any;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = { error: { message: `HTTP ${res.status}: ${res.statusText}` } };
      }
      const msg =
        (typeof errorBody?.error?.message === "string" && errorBody.error.message) ||
        (typeof errorBody?.detail?.message === "string" && errorBody.detail.message) ||
        (typeof errorBody?.detail === "string" && errorBody.detail) ||
        `HTTP ${res.status}: ${res.statusText}`;

      const err: any = new Error(msg);
      err.status = res.status;
      err.retryAfter = res.headers.get("Retry-After");
      err.details = errorBody?.error?.details || errorBody?.detail;
      throw err;
    }

    const data = await res.json();
    return { data, durationMs, reqId };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - t0);
    throw new Error(err.message || "Failed to connect to backend API");
  }
}

export const api = {
  // System Health
  async getHealth(): Promise<{ data: SystemHealth; durationMs: number }> {
    return request<SystemHealth>("/api/v1/health");
  },

  // Medicines Search
  async searchMedicines(query: string, limit = 20): Promise<{ data: { count: number; results: MedicineSearchResult[] }; durationMs: number }> {
    return request(`/api/v1/medicines?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Medicine Profile
  async getMedicineDetails(brandId: number): Promise<{ data: MedicineDetails; durationMs: number }> {
    return request(`/api/v1/medicines/${brandId}`);
  },

  // Interactions Check
  async checkInteractions(medicines: string[]): Promise<{ data: InteractionReport; durationMs: number }> {
    return request<InteractionReport>("/api/v1/interactions/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicines }),
    });
  },

  // Conversational Chat
  async sendChat(message: string, medicines: string[] = []): Promise<{ data: ChatResponse; durationMs: number }> {
    return request<ChatResponse>("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, medicines }),
    });
  },

  // Explain Prescription
  async explainPrescription(medicines: any[]): Promise<{ data: PrescriptionExplainResponse; durationMs: number }> {
    return request<PrescriptionExplainResponse>("/api/v1/prescriptions/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicines }),
    });
  },

  // RAG Search
  async searchRag(query: string, limit = 5): Promise<{ data: { count: number; results: any[] }; durationMs: number }> {
    return request(`/api/v1/rag/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // OCR Status
  async getOcrStatus(): Promise<{ data: any; durationMs: number }> {
    return request("/api/v1/ocr/status");
  },

  // OCR Prescription Analyze
  async analyzePrescription(
    file: File,
    dbLookup = true,
    useVisionFallback = true,
  ): Promise<{ data: OCRAnalysisResponse; durationMs: number }> {
    const formData = new FormData();
    formData.append("file", file);
    return request<OCRAnalysisResponse>(
      `/api/v1/prescriptions/analyze?db_lookup=${dbLookup}&use_vision_fallback=${useVisionFallback}`,
      {
        method: "POST",
        body: formData,
      },
    );
  },

  // Prescription History API (Database Persistence) & Daily Quota
  async getPrescriptionDailyQuota(): Promise<{
    data: {
      status: string;
      data: {
        daily_limit: number;
        used_today: number;
        remaining: number;
        can_analyze: boolean;
        reset_info: string;
      };
    };
    durationMs: number;
  }> {
    return request("/api/v1/prescriptions/daily-quota");
  },

  async getAllUsageLimits(): Promise<{
    data: {
      status: string;
      limits: Record<string, {
        feature: string;
        label_bn: string;
        label_en: string;
        daily_limit: number;
        used_today: number;
        remaining: number;
        can_use: boolean;
        reset_info: string;
      }>;
    };
    durationMs: number;
  }> {
    return request("/api/v1/prescriptions/usage-limits");
  },

  async getPrescriptionHistory(): Promise<{
    data: {
      status: string;
      total_count: number;
      history: Array<{
        id: string;
        doctor_name: string;
        patient_name: string;
        patient_age?: string;
        patient_gender?: string;
        prescription_date?: string;
        diagnosis?: string;
        total_medicines: number;
        created_at: string;
      }>;
    };
    durationMs: number;
  }> {
    return request("/api/v1/prescriptions/history");
  },

  async savePrescriptionHistory(data: any): Promise<{ data: { status: string; message: string; history_item: any }; durationMs: number }> {
    return request("/api/v1/prescriptions/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
  },

  async updatePrescriptionHistory(historyId: string, data: any): Promise<{ data: { status: string; message: string; history_item: any }; durationMs: number }> {
    return request(`/api/v1/prescriptions/history/${historyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
  },

  async getPrescriptionHistoryItem(historyId: string): Promise<{ data: { status: string; data: any }; durationMs: number }> {
    return request(`/api/v1/prescriptions/history/${historyId}`);
  },

  async deletePrescriptionHistoryItem(historyId: string): Promise<{ data: { status: string; message: string }; durationMs: number }> {
    return request(`/api/v1/prescriptions/history/${historyId}`, {
      method: "DELETE",
    });
  },

  // Google Authentication API
  async getAuthConfig(): Promise<{ data: { google_client_id: string; auth_provider: string }; durationMs: number }> {
    return request("/api/v1/auth/config");
  },

  async saveAuthConfig(google_client_id: string): Promise<{ data: { google_client_id: string; auth_provider: string }; durationMs: number }> {
    return request("/api/v1/auth/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ google_client_id }),
    });
  },

  async loginWithGoogle(
    credential: string,
    role = "patient",
    bmdc?: string
  ): Promise<{
    data: {
      status: string;
      access_token: string;
      token_type: string;
      is_new_user: boolean;
      message: string;
      user: any;
    };
    durationMs: number;
  }> {
    return request("/api/v1/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, role, bmdc }),
    });
  },

  async demoLogin(role: "patient" | "doctor" = "patient"): Promise<{
    data: {
      status: string;
      access_token: string;
      token_type: string;
      is_new_user: boolean;
      message: string;
      user: any;
    };
    durationMs: number;
  }> {
    return this.loginWithGoogle(role === "doctor" ? "demo-doctor-token" : "demo-patient-token", role);
  },

  async getCurrentUser(): Promise<{ data: { status: string; user: any }; durationMs: number }> {
    return request("/api/v1/auth/me");
  },

  async updateProfile(profileData: {
    role?: string;
    bmdc_number?: string;
    title?: string;
    name?: string;
  }): Promise<{ data: { status: string; message: string; user: any }; durationMs: number }> {
    return request("/api/v1/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
  },
};
