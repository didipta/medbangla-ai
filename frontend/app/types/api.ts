/**
 * MedBangla AI - Unified API Types
 */

export interface SystemHealth {
  status: string;
  database_configured: boolean;
  ocr_engine: string;
  rag_indexer: {
    is_loaded: boolean;
    total_chunks_indexed: number;
    vector_search_ready: boolean;
  };
  interaction_engine: {
    cached_monographs: number;
    status: string;
  };
  llm_providers: {
    primary: string;
    groq_configured: boolean;
    fallback: string;
    gemini_configured: boolean;
    offline_deterministic_fallback: boolean;
  };
  allowed_origins: string[];
}

export interface MedicineSearchResult {
  brand_id: number;
  brand_name: string;
  strength?: string;
  form?: string;
  price?: number;
  packsize?: string;
  manufacturer?: string;
  generic_id?: number;
  generic_name?: string;
  match_score?: number;
  has_bilingual_doc?: boolean;
}

export interface MedicineDetails extends MedicineSearchResult {
  indication?: string;
  contra_indication?: string;
  dose?: string;
  side_effect?: string;
  precaution?: string;
  mode_of_action?: string;
  interaction?: string;
  bilingual_profile?: {
    name_bn?: string;
    therapeutic_class?: string;
    sections_bn?: Record<string, string>;
    sections_en?: Record<string, string>;
  };
}

export interface InteractionFinding {
  drug_a: string;
  drug_b: string;
  severity: "CONTRAINDICATED" | "MAJOR" | "MODERATE" | "MINOR";
  severity_bn: string;
  effect_en: string;
  effect_bn: string;
  recommendation_bn: string;
  management_strategy?: string;
  source: string;
}

export interface InteractionReport {
  status: string;
  total_medicines_analyzed: number;
  total_pairs_checked: number;
  interactions_count: number;
  overall_safety_status: "SAFE" | "LOW_RISK" | "MODERATE_WARNING" | "HIGH_RISK" | "CRITICAL_CONTRAINDICATION";
  severity_breakdown: {
    CONTRAINDICATED: number;
    MAJOR: number;
    MODERATE: number;
    MINOR: number;
  };
  interactions: InteractionFinding[];
  is_safe: boolean;
  execution_time_ms: number;
}

export interface SourceReference {
  chunk_id?: string;
  generic_name?: string;
  section?: string;
  score?: number;
}

export interface ChatResponse {
  status: string;
  question: string;
  answer_bn: string;
  retrieved_sources: SourceReference[];
  llm_metadata: {
    provider?: string;
    model?: string;
  };
  disclaimer: string;
  execution_time_ms: number;
}

export interface PrescriptionExplainResponse {
  status: string;
  bangla_explanation: string;
  safety_report: InteractionReport;
  medicines_analyzed: any[];
  retrieved_sources: SourceReference[];
  llm_metadata: {
    provider?: string;
    model?: string;
  };
  disclaimer: string;
  execution_time_ms: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedMedicine {
  raw_token: string;
  matched_brand: string;
  brand_id?: number;
  generic_name?: string;
  strength?: string;
  form?: string;
  dosage?: string;
  instruction?: string;
  manufacturer?: string;
  confidence: number;
  match_score: number;
  requires_verification: boolean;
  bounding_box?: BoundingBox;
}

export interface OCRLineResult {
  line_index: number;
  text: string;
  confidence: number;
  bounding_box: BoundingBox;
  polygon: number[][];
  matched_medicine?: any;
}

export interface OCRAnalysisResponse {
  status: string;
  filename: string;
  image_metadata: {
    original_width: number;
    original_height: number;
    processed_width: number;
    processed_height: number;
    skew_angle: number;
  };
  summary: {
    total_lines_detected: number;
    total_text_lines_read: number;
    total_medicines_matched: number;
    average_confidence: number;
    requires_verification_count: number;
  };
  clinical_entities?: {
    doctor?: Record<string, string>;
    patient?: Record<string, string>;
    vitals?: Record<string, string>;
    clinical_notes?: string[];
    tests_advised?: string[];
  };
  raw_text: string;
  lines: OCRLineResult[];
  detected_medicines: DetectedMedicine[];
  dosage_instructions: any[];
  execution_time_ms: number;
  vision_fallback_applied?: boolean;
  vision_provider?: string;
  history_id?: string;
  daily_quota?: {
    daily_limit: number;
    used_today: number;
    remaining: number;
    can_analyze: boolean;
    reset_info?: string;
  };
}
