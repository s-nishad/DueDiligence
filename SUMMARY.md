# Questionnaire Agent — Design Plan and Implementation

---

## 1. Product & Data Model Alignment

### Planned

* Define a unified data model for:

  * Project, Document, Question, Answer, Reference, Evaluation, Request
* Maintain explicit lifecycle states for:

  * Project (CREATED → READY → OUTDATED)
  * Answer (PENDING → CONFIRMED / REJECTED / MANUAL_UPDATED / MISSING_DATA)
  * Request (QUEUED → RUNNING → COMPLETED / FAILED)
* Ensure API request/response models map directly to persistent storage and vector indexes.

### Implementation

* Core entities and enums are explicitly defined in backend models.
* Status transitions are enforced at the API level.
* Frontend types mirror backend response contracts.
* Persistence is mocked using in-memory storage to focus on lifecycle correctness.

---

## 2. Document Ingestion & Indexing

### Planned

1. **Upload & Background Processing**

   * User uploads a document (PDF, DOCX, XLSX, PPTX).
   * Backend immediately returns a **request/task ID**.
   * Ingestion runs in a background worker.

2. **Parsing & Chunking**

   * Extract text and layout metadata per format.
   * Normalize content into structured text blocks.
   * Split content into semantically meaningful chunks.

3. **Multi-Layer Indexing**

   * **Layer 1 (Answer Retrieval):** section-level or semantic retrieval for answering.
   * **Layer 2 (Citation Layer):** fine-grained chunks with positional/bounding-box references.

4. **ALL_DOCS Consistency**

   * Projects scoped to **ALL_DOCS** automatically become **OUTDATED** when new documents are indexed.


```
Upload → Task ID → Background Parsing
       → Chunking → Embedding → Vector Index
       → Project Status Update
```

### Skeleton Implementation

* Document ingestion endpoint exists and returns immediately.
* Background processing and vector storage are mocked.
* Multi-layer indexing is documented and structurally separated.
* Explicit logic marks **ALL_DOCS projects as OUTDATED** when new documents are indexed.

---

## 3. Questionnaire Parsing & Project Lifecycle

### Planned

* Parse questionnaire files (e.g., ILPA PDF) into:

  * Ordered sections
  * Ordered questions per section
* Store parsed questions as structured entities.
* Project creation and updates are asynchronous.
* Regeneration is triggered when documents or configuration change.

### Skeleton Implementation
* Questionnaire parsing is defined as a dedicated service.
* Parsing output schema (sections + ordered questions) is explicitly documented.
* Async project lifecycle endpoints exist.
* Regeneration triggers are defined, execution is mocked.

---

## 4. Answer Generation with Citations & Confidence

### Planned

* Retrieve relevant content from Layer 1 index.
* Generate answers using an LLM.
* Attach chunk-level citations from Layer 2.
* Compute confidence score based on retrieval relevance.
* If no relevant content exists, mark answer as NOT_FOUND.

### Skeleton Implementation

* Single and batch answer generation endpoints exist.
* Answer contract always includes:

  * answerability indicator
  * citations
  * confidence score
* Retrieval and scoring logic are mocked to emphasize correctness of the contract.

---

## 5. Review & Manual Overrides

### Planned

* Human reviewers can confirm, reject, manually update, or mark missing data.
* Manual answers are stored alongside AI answers for auditability.

### Skeleton Implementation

* Review workflow implemented via explicit status transitions.
* Manual answers are stored separately from AI outputs.
* Frontend review components and actions are present.

---

## 6. Evaluation Framework

### Planned

* Compare AI answers with human ground truth using:

  * semantic similarity (embeddings)
  * keyword overlap
* Produce numeric scores and qualitative explanations.
* Aggregate evaluation metrics at project level.

### Skeleton Implementation

* Evaluation framework is clearly defined and documented.
* Evaluation models and UI screen exist.
* Scoring logic is mocked to focus on design clarity.

---

## 7. Optional Chat Extension

### Planned

* Chat uses the same indexed corpus and citation logic.
* Read-only interaction.
* Does not modify questionnaire answers.

---

## 8. Frontend Experience (High-Level)

### Planned

* Users can create and update projects.
* Upload and index documents.
* Track async background tasks.
* Review answers and view evaluation reports.

### Skeleton Implementation

* All required screens exist as page-level containers.
* Each page includes TODOs mapping directly to backend APIs.
* Reusable components and API client abstraction are implemented.
* UI is intentionally minimal.

---
