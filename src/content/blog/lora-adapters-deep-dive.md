---
title: "LoRA Adapters: Deep Dive into Low-Rank Adaptation"
date: "2025-03-02"
description: "The math and mechanics of low-rank matrices and their weight update merges."
tags: ["LLM & RAG", "LoRA", "Math"]
readTime: "8 min read"
---

Low-Rank Adaptation (LoRA) updates model weights by factoring updates into smaller matrices.

We review how matrix dimensions relate to model ranks (r) and how alpha values scale training impact.

Merging adapter weights back into the base model ensures zero added latency during inference.
