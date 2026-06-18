---
title: "Designing RAG Systems for Sub-150ms Latency"
date: "2026-05-24"
description: "Optimization strategies to build production RAG pipelines that retrieve and rank context in milliseconds."
tags: ["RAG", "Embeddings", "Vector Databases", "System Design"]
readTime: "5 min read"
---

Retrieval-Augmented Generation (RAG) is the default pattern for grounding LLMs in dynamic corporate data. However, standard out-of-the-box RAG pipelines often suffer from massive query latency (frequently exceeding 1 to 2 seconds). In production applications, especially learning platforms, this delay kills engagement.

At KAM Global AI, I optimized a production RAG pipeline to achieve an average query latency of **120ms** (sub-150ms). Here is the system design checklist I used to achieve this speed.

---

## 1. Vector Database Chunk & Index Choice
Vector search latency depends heavily on the index algorithm. While **HNSW (Hierarchical Navigable Small World)** indexes provide high recall, they can be slow to build and load. 

We optimized our configuration using the following strategies:
* **HNSW Parameter Tuning**: Set `efConstruction=200` (build-time accuracy) and `efSearch=16` (search-time candidates limit). Reducing `efSearch` cut vector lookup time by **40%** with a negligible <1% loss in retrieval recall.
* **Vector Quantization (Scalar Quantization - SQ8)**: Reduced the raw float32 vector embeddings to int8. This compressed the vector index footprint by **4x**, keeping the index fully cached in memory for faster lookup.

---

## 2. Dynamic Asynchronous Context Retrieval
In a traditional RAG pipeline, the query goes through serial steps:
1. Embed the query.
2. Search Vector DB.
3. Fetch metadata from document storage.
4. Call LLM API.

We replaced this with a **concurrent pipeline**:

```text
               ┌──> Search Vector DB ──> Rerank Filter ──┐
User Query ────┼                                         ├──> Merge ──> Call LLM
               └──> Cache Check ─────────────────────────┘
```

By querying the Vector DB and checking memory cache (Redis) concurrently, we bypassed disk lookups entirely for frequently accessed document metadata.

---

## 3. Two-Stage Retrieval (Reranking Filter)
Retrieving 20-30 chunks directly to the LLM increases token cost and processing time. 

Instead, we used a **Two-Stage Retrieval** strategy:
1. **Stage 1**: Retrieve the top 50 matches using a fast, quantized cosine-similarity index from the Vector DB.
2. **Stage 2**: Feed the 50 candidate matches into a lightweight local **Cross-Encoder Reranker** (like `bge-reranker-base`), filtering it down to the top 4 highly relevant context chunks.

Reranking localizes the best information in milliseconds and reduces the LLM prompt size by **80%**, saving massive processing overhead.

---

## 4. Local Embedding Generation
Do not call cloud APIs (like OpenAI or Cohere) to embed user questions during the query lifecycle! A cloud API call introduces network handshakes and payload latencies ranging from 100ms to 400ms.

Instead, compile your embedding models (like `all-MiniLM-L6-v2` or `bge-small`) to **ONNX runtime** and execute them locally on the application server. Local ONNX embedding inference takes under **8ms**, eliminating network overhead completely.
