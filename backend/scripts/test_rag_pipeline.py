"""
MedBangla AI - RAG & Safety Engine Latency & Accuracy Benchmark
================================================================
Benchmarks:
1. RAG Indexer search time (Target: < 5ms)
2. Pairwise drug interaction check time (Target: < 1ms)
3. Full clinical prescription explanation with Groq/Gemini (Target: < 1500ms)
4. Bengali conversational Q&A response
"""

import sys
import time
import json
import logging
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RAGTest")


def test_pipeline():
    logger.info("=== STEP 1: INITIALIZING RAG INDEXER ===")
    t0 = time.time()
    from app.ai.rag.indexer import ClinicalRAGIndexer
    indexer = ClinicalRAGIndexer.get_instance()
    t_init = (time.time() - t0) * 1000
    logger.info("Indexer initialized in %.2f ms. Total chunks: %d", t_init, len(indexer.chunks))

    # Test 1: Fast Vector & Metadata Search
    logger.info("\n=== STEP 2: BENCHMARKING VECTOR SEARCH SPEED ===")
    test_queries = [
        ("প্যারাসিটামল কী কাজে লাগে?", "paracetamol"),
        ("Ciprofloxacin dosage and side effects", "ciprofloxacin"),
        ("গ্যাস্ট্রিকের সমস্যায় সেক্লো বা ওমিপ্রাজল খাওয়ার নিয়ম", "omeprazole"),
        ("High blood pressure tablet", "losartan"),
    ]
    for q, med in test_queries:
        t_start = time.time()
        results = indexer.search(query=q, medicine_filter=[med] if med else None, top_k=3)
        t_search = (time.time() - t_start) * 1000
        logger.info(
            "Query: '%s' | Latency: %.2f ms | Hits: %d | Top match: %s (score: %.3f)",
            q,
            t_search,
            len(results),
            results[0]["chunk_id"] if results else "None",
            results[0]["retrieval_score"] if results else 0.0,
        )

    # Test 2: Deterministic Drug Interactions Check
    logger.info("\n=== STEP 3: BENCHMARKING DRUG-DRUG INTERACTIONS SPEED ===")
    from app.ai.rag.interactions import DrugInteractionEngine
    int_engine = DrugInteractionEngine.get_instance()

    test_prescriptions = [
        # Major Chelation Interaction
        ["Ciprofloxacin", "Calcium Vitamin D3", "Paracetamol"],
        # Major CYP2C19 Interaction
        ["Clopidogrel", "Omeprazole", "Aspirin"],
        # Critical Contraindication (Duplicate NSAIDs)
        ["Aceclofenac", "Naproxen", "Pantoprazole"],
        # Safe Multi-Drug Regimen
        ["Paracetamol", "Montelukast", "Fexofenadine", "Esomeprazole"],
    ]

    for med_list in test_prescriptions:
        t_start = time.time()
        rep = int_engine.analyze_prescription_medicines(med_list)
        t_int = (time.time() - t_start) * 1000
        logger.info(
            "Prescription: %s | Checked %d pairs in %.3f ms | Status: %s | Interactions: %d",
            med_list,
            rep["total_pairs_checked"],
            t_int,
            rep["overall_safety_status"],
            rep["interactions_count"],
        )
        for i_item in rep["interactions"]:
            logger.info("   -> [%s] %s + %s: %s", i_item["severity"], i_item["drug_a"], i_item["drug_b"], i_item["effect_bn"])

    # Test 3: End-to-End Bangla Prescription Explanation
    logger.info("\n=== STEP 4: END-TO-END RAG EXPLANATION & LLM GENERATION ===")
    from app.ai.rag.engine import MedBanglaRAGEngine
    rag_engine = MedBanglaRAGEngine.get_instance()

    sample_rx = [
        {"matched_brand": "Napa 500mg", "generic_name": "Paracetamol", "dosage": "১+১+১ (খাবারের পর)"},
        {"matched_brand": "Neoflox 500mg", "generic_name": "Ciprofloxacin", "dosage": "১+০+১ (খাবারের আগে)"},
        {"matched_brand": "Calbo-D", "generic_name": "Calcium Vitamin D3", "dosage": "০+০+১ (রাতে খাবারের পর)"},
    ]

    t_start = time.time()
    explanation = rag_engine.explain_prescription(sample_rx)
    t_rx = (time.time() - t_start) * 1000
    logger.info("Prescription RAG Explanation generated in %.2f ms", t_rx)
    logger.info("LLM Provider: %s (%s)", explanation["llm_metadata"]["provider"], explanation["llm_metadata"]["model"])
    logger.info("Safety Status: %s | Interactions: %d", explanation["safety_report"]["overall_safety_status"], len(explanation["safety_report"]["interactions"]))
    print("\n--- BANGLA EXPLANATION OUTPUT ---")
    print(explanation["bangla_explanation"][:600] + "...\n")

    # Test 4: Conversational Q&A
    logger.info("\n=== STEP 5: BANGLA CONVERSATIONAL Q&A ===")
    q_test = "সিপ্রোফ্লক্সাসিন অ্যান্টিবায়োটিক কি দুধের সাথে খাওয়া যাবে?"
    t_start = time.time()
    chat_res = rag_engine.chat_qa(question=q_test, context_medicines=["Ciprofloxacin"])
    t_chat = (time.time() - t_start) * 1000
    logger.info("Chat Q&A responded in %.2f ms (Provider: %s)", t_chat, chat_res["llm_metadata"]["provider"])
    print("\n--- CHAT Q&A OUTPUT ---")
    print(chat_res["answer_bn"][:500] + "...\n")

    logger.info("\nALL BENCHMARKS COMPLETED SUCCESSFULLY!")


if __name__ == "__main__":
    test_pipeline()
