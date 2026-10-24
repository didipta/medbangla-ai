import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import {
  OCRAnalysisResponse,
  InteractionReport,
  PrescriptionExplainResponse,
} from "../../types/api";

export interface VerifiedMedicineItem {
  id: string;
  brand: string;
  generic: string;
  dosage: string;
  form: string;
  confidence: number;
  status: "confirmed" | "uncertain" | "unmatched";
  included: boolean;
  notes?: string;
}

export interface DailyQuotaState {
  daily_limit: number;
  used_today: number;
  remaining: number;
  can_analyze: boolean;
  reset_info: string;
}

export interface PrescriptionState {
  // Daily Quota (Max 2 analyses per user per day)
  dailyQuota: DailyQuotaState;
  quotaLoading: boolean;

  // Active Prescription Tracking
  currentPrescriptionId: string | null;
  result: OCRAnalysisResponse | null;
  medicines: VerifiedMedicineItem[];
  safetyReport: InteractionReport | null;
  safetyLoading: boolean;
  explanation: PrescriptionExplainResponse | null;
  explainLoading: boolean;
  latency: number | null;
  analyzing: boolean;
  error: string | null;

  // History State
  historyList: any[];
  historyLoading: boolean;
  isPrescriptionLoading: boolean;
  loadingHistoryId: string | null;
}

const initialQuota: DailyQuotaState = {
  daily_limit: 2,
  used_today: 0,
  remaining: 2,
  can_analyze: true,
  reset_info: "রাত ১২:০০টায় কোটা রিসেট হবে",
};

const initialState: PrescriptionState = {
  dailyQuota: initialQuota,
  quotaLoading: true,

  currentPrescriptionId: null,
  result: null,
  medicines: [],
  safetyReport: null,
  safetyLoading: false,
  explanation: null,
  explainLoading: false,
  latency: null,
  analyzing: false,
  error: null,

  historyList: [],
  historyLoading: false,
  isPrescriptionLoading: false,
  loadingHistoryId: null,
};

// Async Thunks
export const fetchDailyQuota = createAsyncThunk(
  "prescription/fetchDailyQuota",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getPrescriptionDailyQuota();
      if (res.data?.data) {
        return res.data.data;
      }
      return rejectWithValue("Failed to fetch daily quota");
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch daily quota");
    }
  }
);

export const fetchHistory = createAsyncThunk(
  "prescription/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getPrescriptionHistory();
      if (res.data?.history) {
        return res.data.history;
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch history");
    }
  }
);

export const deleteHistoryItem = createAsyncThunk(
  "prescription/deleteHistoryItem",
  async (historyId: string, { rejectWithValue }) => {
    try {
      await api.deletePrescriptionHistoryItem(historyId);
      return historyId;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete history item");
    }
  }
);

export const loadHistoryItem = createAsyncThunk(
  "prescription/loadHistoryItem",
  async (historyId: string, { rejectWithValue }) => {
    try {
      const res = await api.getPrescriptionHistoryItem(historyId);
      if (res.data?.data) {
        return res.data.data;
      }
      return rejectWithValue("Item not found");
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load history item");
    }
  }
);

export const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    setDailyQuota: (state, action: PayloadAction<Partial<DailyQuotaState>>) => {
      state.dailyQuota = { ...state.dailyQuota, ...action.payload };
    },
    optimisticIncrementQuota: (state) => {
      const newUsed = Math.min(state.dailyQuota.daily_limit, state.dailyQuota.used_today + 1);
      const newRemaining = Math.max(0, state.dailyQuota.daily_limit - newUsed);
      state.dailyQuota.used_today = newUsed;
      state.dailyQuota.remaining = newRemaining;
      state.dailyQuota.can_analyze = newRemaining > 0;
    },
    setCurrentPrescriptionId: (state, action: PayloadAction<string | null>) => {
      state.currentPrescriptionId = action.payload;
    },
    setResult: (state, action: PayloadAction<OCRAnalysisResponse | null>) => {
      state.result = action.payload;
    },
    setMedicines: (state, action: PayloadAction<VerifiedMedicineItem[]>) => {
      state.medicines = action.payload;
    },
    updateMedicineItem: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<VerifiedMedicineItem> }>
    ) => {
      const idx = state.medicines.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) {
        state.medicines[idx] = { ...state.medicines[idx], ...action.payload.updates };
      }
    },
    addMedicineItem: (state, action: PayloadAction<VerifiedMedicineItem>) => {
      state.medicines.push(action.payload);
    },
    removeMedicineItem: (state, action: PayloadAction<string>) => {
      state.medicines = state.medicines.filter((m) => m.id !== action.payload);
    },
    setSafetyReport: (state, action: PayloadAction<InteractionReport | null>) => {
      state.safetyReport = action.payload;
    },
    setSafetyLoading: (state, action: PayloadAction<boolean>) => {
      state.safetyLoading = action.payload;
    },
    setExplanation: (state, action: PayloadAction<PrescriptionExplainResponse | null>) => {
      state.explanation = action.payload;
    },
    setExplainLoading: (state, action: PayloadAction<boolean>) => {
      state.explainLoading = action.payload;
    },
    setLatency: (state, action: PayloadAction<number | null>) => {
      state.latency = action.payload;
    },
    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.analyzing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetAnalysisState: (state) => {
      state.result = null;
      state.medicines = [];
      state.safetyReport = null;
      state.explanation = null;
      state.latency = null;
      state.error = null;
      state.currentPrescriptionId = null;
    },
    clearUserSessionData: (state) => {
      state.result = null;
      state.medicines = [];
      state.safetyReport = null;
      state.safetyLoading = false;
      state.explanation = null;
      state.explainLoading = false;
      state.latency = null;
      state.error = null;
      state.currentPrescriptionId = null;
      state.historyList = [];
      state.historyLoading = false;
      state.analyzing = false;
      state.isPrescriptionLoading = false;
      state.loadingHistoryId = null;
    },
  },
  extraReducers: (builder) => {
    // Daily Quota
    builder
      .addCase(fetchDailyQuota.pending, (state) => {
        state.quotaLoading = true;
      })
      .addCase(fetchDailyQuota.fulfilled, (state, action) => {
        state.dailyQuota = action.payload;
        state.quotaLoading = false;
      })
      .addCase(fetchDailyQuota.rejected, (state) => {
        state.quotaLoading = false;
      });

    // History List
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.historyList = action.payload;
        state.historyLoading = false;
      })
      .addCase(fetchHistory.rejected, (state) => {
        state.historyLoading = false;
      });

    // Delete History Item (Quota must remain independent!)
    builder
      .addCase(deleteHistoryItem.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.historyList = state.historyList.filter((item) => item.id !== deletedId);
        if (state.currentPrescriptionId === deletedId) {
          state.currentPrescriptionId = null;
        }
      });

    // Load History Item
    builder
      .addCase(loadHistoryItem.pending, (state, action) => {
        state.isPrescriptionLoading = true;
        state.loadingHistoryId = action.meta.arg;
      })
      .addCase(loadHistoryItem.fulfilled, (state, action) => {
        state.isPrescriptionLoading = false;
        state.loadingHistoryId = null;
        const item = action.payload;
        state.currentPrescriptionId = item.id;

        // Build OCR Analysis response from history item
        const mockResult: OCRAnalysisResponse = {
          status: "success",
          filename: `history_${item.id}.png`,
          image_metadata: {
            original_width: 800,
            original_height: 1000,
            processed_width: 800,
            processed_height: 1000,
            skew_angle: 0,
          },
          clinical_entities: item.clinical_entities || {
            doctor: { name: item.doctor_name || "ডাঃ নাম পাওয়া যায়নি" },
            patient: {
              name: item.patient_name || "রোগী",
              age: item.patient_age || "",
              gender: item.patient_gender || "",
            },
            diagnosis: item.diagnosis ? [item.diagnosis] : [],
          },
          detected_medicines: item.detected_medicines || [],
          dosage_instructions: item.dosage_instructions || [],
          summary: item.summary || {
            total_medicines_matched: item.total_medicines || (item.detected_medicines || []).length,
          },
          raw_text: item.raw_text || "",
          lines: [],
          execution_time_ms: 0,
          history_id: item.id,
        };

        state.result = mockResult;

        // Populate verified medicines list
        if (item.detected_medicines) {
          state.medicines = item.detected_medicines.map((m: any, idx: number) => {
            const score = m.match_score || Math.round((m.confidence || 0.85) * 100);
            let status: "confirmed" | "uncertain" | "unmatched" = "confirmed";
            if (score < 50) status = "unmatched";
            else if (score < 80) status = "uncertain";

            return {
              id: `med-${idx}-${Date.now()}`,
              brand: m.matched_brand || m.raw_token || "Medicine",
              generic: m.generic_name || m.matched_brand || "Generic",
              dosage: m.dosage || "১ + ০ + ১",
              form: m.form || "Tablet",
              confidence: score,
              status,
              included: true,
              notes: m.instruction || undefined,
            };
          });
        }
      })
      .addCase(loadHistoryItem.rejected, (state, action) => {
        state.isPrescriptionLoading = false;
        state.loadingHistoryId = null;
        state.error = (action.payload as string) || "হিস্ট্রি লোড করতে ব্যর্থ হয়েছে";
      });
  },
});

export const {
  setDailyQuota,
  optimisticIncrementQuota,
  setCurrentPrescriptionId,
  setResult,
  setMedicines,
  updateMedicineItem,
  addMedicineItem,
  removeMedicineItem,
  setSafetyReport,
  setSafetyLoading,
  setExplanation,
  setExplainLoading,
  setLatency,
  setAnalyzing,
  setError,
  resetAnalysisState,
  clearUserSessionData,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
