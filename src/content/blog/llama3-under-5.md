---
title: "How I Fine-Tuned LLaMA 3 Under $5"
date: "2026-06-15"
description: "A practical guide to parameter-efficient fine-tuning (PEFT/LoRA) using budget spot GPU instances."
tags: ["LLM", "Fine-Tuning", "LoRA", "PyTorch"]
readTime: "6 min read"
---

Fine-tuning large language models (LLMs) used to be the playground of big tech companies with massive GPU clusters. However, with parameter-efficient techniques like **LoRA (Low-Rank Adaptation)** and **QLoRA (Quantized LoRA)**, you can now fine-tune a model like LLaMA-3-8B on task-specific data for less than the price of a coffee.

In this logbook post, I share the exact playbook I used to fine-tune LLaMA 3 on a specialized dataset using a cheap GPU spot instance.

---

## 1. The Setup (Spot Instances)
Instead of renting expensive dedicated cloud nodes, I used a rented spot instance of an **RTX 3090 (24GB VRAM)**, which costs around **$0.40/hour**. The dataset consisted of 5,000 instruction-following pairs, which takes less than 2 hours to train using parameter-efficient optimization.

Total Compute Cost: **~$0.80**.

---

## 2. Quantization & LoRA Configuration
To fit an 8B parameter model into a single 24GB GPU while maintaining training throughput, we quantize the base model to 4-bit precision (NF4) and train low-rank adapters.

Here is the setup script in PyTorch using `peft` and `transformers`:

```python
import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model

# NF4 Quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16
)

# Load base LLaMA 3 model
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B-Instruct",
    quantization_config=bnb_config,
    device_map="auto"
)

# LoRA adapter settings
lora_config = LoraConfig(
    r=16, 
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
```

By focusing training strictly on target adapter layers, we reduce trainable parameters from 8 Billion to just **~13.6 Million** (less than 0.2% of the original model size).

---

## 3. Training & Convergence
Using Hugging Face's `SFTTrainer` (Supervised Fine-Tuning Trainer) with gradient checkpointing enabled, we trained for 3 epochs.

Key metrics observed:
* **Max VRAM usage**: 14.8 GB (fully safe on standard consumer GPUs).
* **Training time**: 1h 45m.
* **Final loss**: Decreased from 1.84 to 0.62.

---

## 4. Serving the Adapter
Once training is complete, there is no need to save the full 16GB model weights. We only save the **LoRA adapters** (which take up less than **50 MB** of storage!). 

At inference time, you load the base model and dynamically merge the adapter weights:

```python
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B-Instruct")
peft_model = PeftModel.from_pretrained(base_model, "./lora_output_adapters")
merged_model = peft_model.merge_and_unload()
```

This makes deployment extremely efficient, as a single base model can serve multiple domain adapters dynamically!
