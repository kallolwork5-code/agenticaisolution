# Agentic AI Platform

This repository is split into two clear parts:

## backend/
Contains the complete Agentic AI backend:
- FastAPI
- LangGraph agents
- Prompt repository (SQLite)
- Auditability & observability

## frontend/
Placeholder for UI (React / Next.js / etc).


# Agentic AI Ingestion Platform (Production-Grade)

This repository contains a **production-grade Agentic AI backend** designed for **payment and reconciliation use cases**.  
The system classifies uploaded datasets (rate cards, routing logic, acquirer transactions) using a **rule-first, LLM-assisted agent** with full **auditability, governance, and observability**.

This is **not a chatbot**.  
It is a **controlled AI decision system** suitable for regulated environments such as payments, banking, and financial risk platforms.

---

## 1. Problem Statement

Merchants and payment platforms work with multiple acquirers.  
Data arrives in different formats and purposes, such as:

- Rate card data
- Routing logic
- Acquirer transaction data

Before reconciliation or analytics can happen, the system must:
- Correctly identify the data type
- Avoid hallucinations or assumptions
- Provide explainable decisions
- Be auditable and reproducible

Traditional single-LLM-call approaches are **not acceptable** in regulated financial systems.

---

## 2. Solution Overview

This platform implements an **agentic AI architecture** using:

- **FastAPI** for backend APIs
- **LangGraph** for agent orchestration
- **Rule-first, LLM-second decisioning**
- **Governed, versioned prompt repository**
- **Structured audit logging**
- Optional **LangSmith observability**

Key design goals:
- Deterministic behavior where possible
- LLM usage only when necessary
- Full explainability of every decision

---

## 3. High-Level Architecture



The agent has **explicit state**, **multiple decision nodes**, and **observable execution paths**.

---

## 4. Repository Structure



All logic lives in the **backend**.  
The frontend is intentionally separated for future expansion (React / Next.js).

---

## 5. What Makes This “Agentic AI”

This system uses **LangGraph** instead of a single LLM call.

The ingestion agent:
- Maintains shared state
- Executes multiple steps
- Chooses different paths based on confidence
- Can be traced and audited

### Ingestion Flow

1. File is uploaded
2. Deterministic rules run first
3. If confidence is insufficient, LLM is invoked
4. Data type is classified
5. Storage strategy is decided
6. Decision and reasoning are logged

This approach avoids unsafe, opaque AI behavior.

---

## 6. Rule-First, LLM-Second Strategy

Rules are always evaluated before calling the LLM.

**Why this matters:**

| Benefit | Explanation |
|------|------------|
| Accuracy | Reduces hallucinations |
| Cost | Minimizes LLM usage |
| Auditability | Deterministic logic first |
| Compliance | Required in financial systems |

The LLM is used only as a **fallback**.

---

## 7. Prompt Management (Production-Grade)

Prompts are treated as **governed configuration**, not hardcoded strings.

### Prompt Types

Prompts are stored separately in the database by role and type:

| Prompt Type | Purpose |
|-----------|--------|
| `system` | Agent identity & boundaries |
| `task` | Business objective |
| `safety` | Guardrails & anti-hallucination rules |
| `output_schema` | Deterministic JSON contract |

Each prompt is:
- Versioned
- Auditable
- Independently replaceable

### Runtime Behavior

Although stored separately, prompts are **assembled into a single prompt at runtime** before being sent to the LLM.

This gives:
- Simplicity for the model
- Control and governance for humans

---

## 8. Why Prompts Are Split (Not One Big Prompt)

Splitting prompts is intentional and required for production systems:

- Enables prompt rollback
- Enables precise audit diffs
- Allows independent ownership (platform, product, risk)
- Prevents accidental behavior changes

This is standard practice in regulated AI systems.

---

## 9. Auditability & Explainability

Every agent decision is logged with:
- Input context
- Final classification
- Confidence score
- Short factual reasoning

This enables:
- Replay of decisions
- Debugging
- Incident investigation
- Regulatory audits

---

## 10. Observability (LangSmith – Optional)

The system supports **LangSmith** for:
- Agent execution traces
- Prompt inspection
- Latency analysis

LangSmith is optional:
- Disabled in local development
- Enabled in staging/production via environment variables

The application runs fully without it.

---

## 11. How to Run the Application

### Prerequisites
- Python 3.10 or 3.11 (recommended)
- pip

### Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
