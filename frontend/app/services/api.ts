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

export const DEFAULT_API_URL = "http://localhost:8000";

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

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
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
      const msg = errorBody?.error?.message || errorBody?.detail || "Request failed";
      throw new Error(msg);
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
};
