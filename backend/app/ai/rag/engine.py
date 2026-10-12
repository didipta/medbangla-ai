"""
MedBangla AI - Core RAG & Medication Safety Engine
==================================================
Orchestrates hierarchical document retrieval, deterministic drug-drug
interaction analysis, and empathetic clinical explanations in natural Bangla.

Latency & Complexity Priorities:
- Retrieval: O(K * d) dense vector search + metadata pre-filtering (< 2ms)
- Interaction Check: Deterministic hash map lookup (< 1ms)
- Generation: High-throughput Groq Llama-3.3 (300ms) with Gemini failover.
"""

import time
import logging
from typing import List, Dict, Any, Optional

from app.ai.rag.indexer import ClinicalRAGIndexer
from app.ai.rag.interactions import DrugInteractionEngine
from app.ai.rag.llm_provider import LLMProvider
from app.ai.rag.prompt_templates import (
    CLINICAL_RAG_SYSTEM_PROMPT,
    MEDICAL_DISCLAIMER_BN,
    INTERACTION_EXPLANATION_PROMPT,
)

logger = logging.getLogger(__name__)


class MedBanglaRAGEngine:
    """
    Unified RAG and Safety Engine. Singleton pattern for zero-overhead query reuse.
    """

    _instance: Optional["MedBanglaRAGEngine"] = None

    def __init__(self):
        self.indexer = ClinicalRAGIndexer.get_instance()
        self.interaction_engine = DrugInteractionEngine.get_instance()
        self.llm = LLMProvider()

    @classmethod
    def get_instance(cls) -> "MedBanglaRAGEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def explain_prescription(
        self,
        medicines: List[Dict[str, Any]],
        clinical_notes: Optional[List[str]] = None,
        patient_info: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generates full clinical prescription analysis:
        1. Sub-millisecond deterministic drug-drug interaction check.
        2. Focused RAG context retrieval for detected medicines.
        3. Clear patient explanation in accessible Bangla.
        """
        start_time = time.time()

        # Step 1: Pairwise interaction check (< 1ms)
        safety_analysis = self.interaction_engine.analyze_prescription_medicines(medicines)

        # Step 2: Extract generic slugs and fetch relevant sections
        medicine_names = []
        for m in medicines:
            gen = m.get("generic_name") or m.get("matched_brand") or m.get("raw_token")
            if gen:
                medicine_names.append(str(gen))

        # Retrieve top relevant clinical sections (< 2ms)
        retrieved_chunks = []
        for med_name in list(dict.fromkeys(medicine_names))[:5]:
            hits = self.indexer.search(query=med_name, medicine_filter=[med_name], top_k=3)
            retrieved_chunks.extend(hits)

        # Step 3: Format clinical context for LLM prompt
        context_blocks = []
        for c in retrieved_chunks:
            title = c.get("section_title_bn") or c.get("section_key")
            gen_name = c.get("name_bn") or c.get("name_en")
            body = c.get("content_bn") or c.get("content_en")
            if body:
                context_blocks.append(f"[{gen_name} - {title}]:\n{body[:500]}")

        clinical_context_str = "\n\n".join(context_blocks) if context_blocks else "No specific monograph found."

        # Interaction context summary
        interaction_summary_str = ""
        if safety_analysis.get("interactions"):
            int_items = []
            for item in safety_analysis["interactions"]:
                int_items.append(
                    f"- {item.get('drug_a')} + {item.get('drug_b')} ({item.get('severity_bn', 'সতর্কতা')}): "
                    f"{item.get('effect_bn')} পরামর্শ: {item.get('recommendation_bn')}"
                )
            interaction_summary_str = "\n".join(int_items)
        else:
            interaction_summary_str = "কোনো সরাসরি ক্ষতিকর মিথস্ক্রিয়া পাওয়া যায়নি।"

        # Step 4: Build User Prompt
        med_list_str = "\n".join(
            [f"- {m.get('matched_brand', m.get('raw_token', 'Unknown'))} ({m.get('generic_name', 'N/A')}) - {m.get('dosage', m.get('strength', ''))}" for m in medicines]
        )

        user_prompt = (
            f"রোগীর প্রেসক্রিপশনের ওষুধসমূহ:\n{med_list_str}\n\n"
            f"ওষুধের মিথস্ক্রিয়া ফলাফল:\n{interaction_summary_str}\n\n"
            f"ক্লিনিক্যাল ডকুমেন্টেশন (অফিসিয়াল মনোগ্রাফ):\n{clinical_context_str}\n\n"
            "অনুরোধ:\n"
            "রোগীকে প্রতিটি ওষুধের কাজ, এটি কীভাবে সেবন করতে হবে, গুরুত্বপূর্ণ সতর্কতা ও পার্শ্বপ্রতিক্রিয়া "
            "সহজ বাংলায় পয়েন্ট আকারে বুঝিয়ে বলুন। মিথস্ক্রিয়া থাকলে বিশেষ সতর্কতা দিন।"
        )

        # Step 5: Fast LLM Inference (Groq ~300ms)
        llm_res = self.llm.generate(
            system_prompt=CLINICAL_RAG_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.2,
        )

        exec_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "success",
            "bangla_explanation": llm_res["text"],
            "safety_report": safety_analysis,
            "medicines_analyzed": medicines,
            "retrieved_sources": [
                {
                    "chunk_id": c.get("chunk_id"),
                    "generic_name": c.get("name_en"),
                    "section": c.get("section_title_bn"),
                    "score": c.get("retrieval_score"),
                }
                for c in retrieved_chunks
            ],
            "llm_metadata": {
                "provider": llm_res.get("provider"),
                "model": llm_res.get("model"),
            },
            "disclaimer": MEDICAL_DISCLAIMER_BN,
            "execution_time_ms": exec_time_ms,
        }

    def chat_qa(
        self,
        question: str,
        context_medicines: Optional[List[str]] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Conversational RAG Q&A in natural Bangla.
        Retrieves grounded chunks for the question and generates response in <500ms.
        """
        start_time = time.time()

        # Retrieve relevant clinical sections
        retrieved_chunks = self.indexer.search(
            query=question,
            medicine_filter=context_medicines,
            top_k=4,
        )

        context_texts = []
        for c in retrieved_chunks:
            title = c.get("section_title_bn") or c.get("section_key")
            gen_name = c.get("name_bn") or c.get("name_en")
            body = c.get("content_bn") or c.get("content_en")
            if body:
                context_texts.append(f"[{gen_name} - {title}]:\n{body[:600]}")

        doc_context = "\n\n".join(context_texts) if context_texts else "কোনো সম্পর্কিত ক্লিনিক্যাল মনোগ্রাফ পাওয়া যায়নি।"

        user_prompt = (
            f"রোগীর প্রশ্ন: {question}\n\n"
            f"প্রাসঙ্গিক ওষুধ তালিকা: {', '.join(context_medicines) if context_medicines else 'উল্লেখ নেই'}\n\n"
            f"ক্লিনিক্যাল মনোগ্রাফ তথ্য:\n{doc_context}\n\n"
            "নির্দেশনা:\n"
            "প্রদত্ত তথ্যের ভিত্তিতে রোগীকে সহজ, বোধগম্য প্রমিত বাংলায় উত্তর দিন। তথ্যে যা নেই তা বানাবেন না।"
        )

        llm_res = self.llm.generate(
            system_prompt=CLINICAL_RAG_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.2,
        )

        exec_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "question": question,
            "answer_bn": llm_res["text"],
            "retrieved_sources": [
                {
                    "chunk_id": c.get("chunk_id"),
                    "generic_name": c.get("name_en"),
                    "section": c.get("section_title_bn"),
                    "score": c.get("retrieval_score"),
                }
                for c in retrieved_chunks
            ],
            "llm_metadata": {
                "provider": llm_res.get("provider"),
                "model": llm_res.get("model"),
            },
            "disclaimer": MEDICAL_DISCLAIMER_BN,
            "execution_time_ms": exec_time_ms,
        }
