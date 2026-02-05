# Questionnaire Agent - Task Descriptions & Acceptance Criteria

## Overview
This document provides task descriptions for implementing the Questionnaire Agent system. Each task includes clear acceptance criteria to guide development.

---

## Task 1: Product & Data Model Alignment

### Description
Define and implement the end-to-end data flow for questionnaire projects, documents, questions, answers, references, and evaluation results. Map API request/response models to database entities and storage layout. Ensure enumerations and status transitions are properly captured for Project, Answer, and Request entities.

### Subtasks
1. **Data Flow Design**
   - Document the complete flow from document upload through answer generation to evaluation
   - Define relationships between entities (Project → Documents → Questions → Answers)
   - Specify data dependencies and cascading behaviors

2. **API Model Mapping**
   - Create Pydantic models for all API request/response structures
   - Map API models to database/storage entities
   - Ensure type consistency between frontend TypeScript types and backend Python models

3. **Enumeration Definitions**
   - Define `ProjectStatus`: CREATED, INDEXING, READY, OUTDATED
   - Define `AnswerStatus`: PENDING, CONFIRMED, REJECTED, MANUAL_UPDATED, MISSING_DATA
   - Define `RequestStatus`: QUEUED, RUNNING, COMPLETED, FAILED
   - Define `ProjectScope`: ALL_DOCS, SELECTED_DOCS

4. **Status Transition Rules**
   - Document valid state transitions for each entity
   - Define triggers for status changes
   - Specify validation rules for transitions

### Acceptance Criteria
- [ ] Complete data flow diagram documented showing all entity relationships
- [ ] All API endpoints have corresponding request/response models defined
- [ ] All enumerations match between frontend and backend
- [ ] Status transition rules are explicitly documented with valid paths
- [ ] Data models include all required fields: timestamps, relationships, metadata
- [ ] Storage layout documented (which entities stored where)

---

## Task 2: Document Ingestion & Indexing

### Description
Implement a system to ingest multiple document formats (PDF, DOCX, XLSX, PPTX) and create a multi-layer index. The index must support both semantic retrieval for answer generation and precise citation tracking with bounding box references. Implement logic to mark ALL_DOCS projects as OUTDATED when new documents are indexed.

### Subtasks
1. **Format Support**
   - Implement text extraction for PDF files
   - Implement text extraction for DOCX files
   - Implement text extraction for XLSX files
   - Implement text extraction for PPTX files
   - Handle extraction errors gracefully

2. **Multi-Layer Index Architecture**
   - **Layer 1 (Answer Retrieval)**: Implement semantic search using embeddings
     - Text chunking with configurable size and overlap
     - Embedding generation (768-dim vectors)
     - Vector storage and similarity search
   - **Layer 2 (Citation Tracking)**: Store chunk-level metadata
     - Document ID and name
     - Page number (for PDFs)
     - Bounding box coordinates (x, y, width, height) for PDF text
     - Chunk text content

3. **Indexing Pipeline**
   - Asynchronous document processing
   - Progress tracking via request status
   - Error handling and retry logic
   - Document metadata storage

4. **ALL_DOCS Project Marking**
   - Detect when new document is indexed
   - Identify all projects with scope=ALL_DOCS
   - Mark identified projects as OUTDATED
   - Ensure atomicity of status updates

### Acceptance Criteria
- [ ] All four document formats (PDF, DOCX, XLSX, PPTX) can be ingested
- [ ] Layer 1 index supports semantic similarity search with top-k retrieval
- [ ] Layer 2 index stores complete citation metadata including bounding boxes
- [ ] Indexing is asynchronous with status tracking via request_id
- [ ] When any document is indexed, all ALL_DOCS projects are marked OUTDATED
- [ ] Citation chunks include: document_id, document_name, chunk_text, page_number, bounding_box
- [ ] Error handling covers: unsupported formats, corrupted files, extraction failures

---

## Task 3: Questionnaire Parsing & Project Lifecycle

### Description
Implement questionnaire file parsing to extract sections and questions with proper ordering. Define and implement the complete project lifecycle including creation, updates, and automatic regeneration when configuration changes.

### Subtasks
1. **Questionnaire Parsing**
   - Parse PDF questionnaire files (e.g., ILPA format)
   - Identify and extract section headers
   - Extract questions with ordering
   - Preserve hierarchical structure (sections → questions)
   - Handle various questionnaire formats

2. **Project Creation (Async)**
   - Create project with name and scope
   - Optionally upload and parse questionnaire file
   - Store parsed questionnaire structure
   - Return project_id immediately
   - Process questionnaire parsing in background

3. **Project Updates**
   - Update project name
   - Update project scope
   - Handle scope changes (ALL_DOCS ↔ SELECTED_DOCS)
   - Mark project as OUTDATED when configuration changes

4. **Automatic Regeneration**
   - Detect configuration changes (scope, documents)
   - Trigger regeneration workflow
   - Re-index documents if needed
   - Re-generate all answers
   - Update project status appropriately

### Acceptance Criteria
- [ ] Questionnaire parser extracts sections with titles and ordering
- [ ] Questions are extracted with proper ordering within sections
- [ ] Project creation is asynchronous with immediate return of project_id
- [ ] Questionnaire parsing happens in background without blocking
- [ ] Project updates mark project as OUTDATED
- [ ] Automatic regeneration is triggered when:
  - Project scope changes
  - New documents added to SELECTED_DOCS projects
  - Documents re-indexed for ALL_DOCS projects
- [ ] Regeneration workflow: OUTDATED → INDEXING → READY

---

## Task 4: Answer Generation with Citations & Confidence

### Description
Implement answer generation that indicates answerability, includes chunk-level citations, and provides confidence scores. Define and implement fallback behavior when no relevant documents are found.

### Subtasks
1. **Answer Generation Pipeline**
   - Generate question embedding
   - Perform semantic search in vector store
   - Retrieve top-k relevant chunks
   - Assemble context from chunks
   - Generate answer using LLM
   - Extract citations from used chunks

2. **Answerability Determination**
   - Check if any relevant chunks found
   - Set `answerable=True` if chunks found
   - Set `answerable=False` if no chunks found
   - Return appropriate status (MISSING_DATA if not answerable)

3. **Citation Extraction**
   - Map generated answer to source chunks
   - Extract document metadata for each chunk
   - Include page numbers and bounding boxes
   - Format citations with all required fields

4. **Confidence Calculation**
   - Base confidence: 0.6
   - Add 0.1 per relevant chunk (max 1.0)
   - Adjust based on semantic similarity scores
   - Return confidence as float (0.0 to 1.0)

5. **Fallback Behavior**
   - When no documents relevant:
     - Set `answerable=False`
     - Set `confidence=0.0`
     - Set `status=MISSING_DATA`
     - Return message: "No relevant documents found to answer this question."
     - Return empty citations list

### Acceptance Criteria
- [ ] Every generated answer includes `answerable` boolean field
- [ ] Every generated answer includes `citations` list with chunk-level references
- [ ] Every generated answer includes `confidence` score (0.0 to 1.0)
- [ ] Citations include: document_id, document_name, chunk_text, page_number, bounding_box
- [ ] When no relevant documents: answerable=False, confidence=0.0, status=MISSING_DATA
- [ ] Confidence calculation considers: number of relevant chunks, similarity scores
- [ ] Answer generation is asynchronous with status tracking

---

## Task 5: Review & Manual Overrides

### Description
Implement review workflow supporting status transitions (CONFIRMED, REJECTED, MANUAL_UPDATED, MISSING_DATA). Ensure manual answers are stored alongside AI results for comparison and auditability.

### Subtasks
1. **Review Workflow Implementation**
   - Display AI-generated answer with citations and confidence
   - Provide action buttons: Confirm, Reject, Edit, Mark Missing
   - Handle status transitions with validation
   - Update answer status atomically

2. **Manual Answer Storage**
   - Preserve AI answer in `answer_text` field (never overwrite)
   - Store manual answer in `manual_answer` field
   - Both answers available for comparison
   - Track which answer is active based on status

3. **Status Transition Logic**
   - PENDING → CONFIRMED: Reviewer approves AI answer
   - PENDING → REJECTED: Reviewer rejects AI answer
   - PENDING → MANUAL_UPDATED: Reviewer provides manual answer
   - PENDING → MISSING_DATA: Mark as unanswerable
   - Validate transitions (e.g., can't confirm if already rejected)

4. **Audit Trail**
   - Store timestamps for all status changes
   - Preserve history of status transitions
   - Enable comparison view (AI vs Manual)

### Acceptance Criteria
- [ ] Review UI displays: question, AI answer, citations, confidence score
- [ ] All four status transitions are supported: CONFIRMED, REJECTED, MANUAL_UPDATED, MISSING_DATA
- [ ] AI answer is always preserved in `answer_text` field
- [ ] Manual answer is stored in `manual_answer` field (separate from AI answer)
- [ ] Both answers can be viewed side-by-side for comparison
- [ ] Status transitions are validated (invalid transitions rejected)
- [ ] Timestamps track: created_at, updated_at for auditability
- [ ] Status history is preserved (can see previous statuses)

---

## Task 6: Evaluation Framework

### Description
Implement a framework to compare AI-generated answers with human ground-truth answers using semantic similarity and keyword overlap metrics. Generate evaluation reports with numeric scores and qualitative explanations.

### Subtasks
1. **Similarity Metrics Implementation**
   - **Semantic Similarity**: 
     - Use sentence transformer model (e.g., all-MiniLM-L6-v2)
     - Embed both AI and human answers
     - Calculate cosine similarity
     - Score: 0.0 (no similarity) to 1.0 (identical meaning)
   - **Keyword Overlap**:
     - Extract keywords from both answers (remove stopwords)
     - Calculate Jaccard similarity: |A ∩ B| / |A ∪ B|
     - Score: 0.0 (no overlap) to 1.0 (identical keywords)

2. **Combined Score Calculation**
   - Weight: 70% semantic similarity + 30% keyword overlap
   - Formula: `similarity_score = 0.7 * semantic_sim + 0.3 * keyword_overlap`
   - Return score as float (0.0 to 1.0)

3. **Qualitative Explanation Generation**
   - 0.8-1.0: "Excellent match. Answers convey the same meaning with high semantic similarity and good keyword overlap."
   - 0.6-0.8: "Good match. Answers are semantically similar with moderate keyword overlap. Minor wording differences."
   - 0.4-0.6: "Partial match. Answers cover similar topics but differ in detail or wording."
   - 0.0-0.4: "Poor match. Answers differ significantly in content or meaning."

4. **Evaluation Report Generation**
   - Per-question results with all metrics
   - Aggregate metrics: average score, high/low score counts
   - Visual indicators for score ranges
   - Export functionality (optional)

### Acceptance Criteria
- [ ] Semantic similarity is calculated using embedding-based approach
- [ ] Keyword overlap uses Jaccard similarity on extracted keywords
- [ ] Combined score uses 70/30 weighting (semantic/keyword)
- [ ] Every evaluation result includes numeric score (0.0 to 1.0)
- [ ] Every evaluation result includes qualitative explanation
- [ ] Evaluation report shows per-question results
- [ ] Evaluation report shows aggregate metrics:
  - Average similarity score
  - Number of questions with score ≥ 0.8
  - Number of questions with score < 0.5
- [ ] API endpoints support: single answer comparison, project-wide evaluation, report retrieval

---

## Task 7: Optional Chat Extension

### Description
Implement an optional chat feature that uses the same indexed document corpus and citations as the questionnaire system, with constraints to avoid conflicting with questionnaire flows.

### Subtasks
1. **Chat Retrieval**
   - Use same VectorStore as questionnaire answers
   - Perform semantic search on user query
   - Retrieve relevant chunks with citations
   - Generate chat response using same LLM pipeline

2. **Citation Integration**
   - Include document references in chat responses
   - Use same citation format as questionnaire answers
   - Display citations with document names and page numbers

3. **Conflict Prevention**
   - Chat does not modify questionnaire answers
   - Chat does not affect project status
   - Chat conversations are separate from project workflow
   - Chat answers are not stored as project answers

4. **Constraints**
   - Chat is read-only (no modifications to indexed data)
   - Chat uses same documents but separate context
   - Chat responses don't trigger regeneration

### Acceptance Criteria
- [ ] Chat uses the same VectorStore/index as questionnaire system
- [ ] Chat responses include citations in same format as questionnaire answers
- [ ] Chat does not modify any project data or answers
- [ ] Chat does not affect project status or trigger regeneration
- [ ] Chat conversations are isolated from questionnaire workflow
- [ ] Chat API endpoint: `POST /api/chat/message` with {project_id, message}

---

## Task 8: Frontend Experience

### Description
Implement all UI screens for project management, question review, document management, evaluation reporting, and status tracking. Ensure all core user workflows are functional.

### Subtasks
1. **Project List Screen** (`/`)
   - Display all projects with name, scope, status
   - Status badges with color coding
   - Create new project form (name, scope selection)
   - Filter by status (optional)
   - Navigate to project detail

2. **Project Detail Screen** (`/project/:id`)
   - Display project metadata (name, scope, status)
   - Show questionnaire sections and questions
   - Display answer status per question
   - "Generate All Answers" button
   - Navigate to question review
   - Navigate to evaluation report
   - Show associated documents

3. **Question Review Screen** (`/project/:projectId/question/:questionId`)
   - Display question text
   - Display AI-generated answer
   - Show citations with document links
   - Display confidence score
   - Action buttons: Confirm, Reject, Edit, Mark Missing
   - Manual answer input field
   - Save status update

4. **Document Management Screen** (`/documents`)
   - File upload component (PDF, DOCX, XLSX, PPTX)
   - Document list with indexing status
   - Indexing progress indicator
   - OUTDATED project warnings
   - Project selection dropdown
   - Support ALL_DOCS vs SELECTED_DOCS behavior

5. **Evaluation Report Screen** (`/evaluation/:projectId`)
   - Per-question comparison (AI vs Human)
   - Similarity scores with visual indicators
   - Aggregate metrics dashboard
   - Human answer input form
   - Export report button (optional)

6. **Request Status Screen** (`/requests`)
   - Request ID input/search
   - Status display (QUEUED, RUNNING, COMPLETED, FAILED)
   - Progress bars for running requests
   - Error messages for failed requests
   - Auto-polling for active requests

### Acceptance Criteria
- [ ] All 6 screens are implemented and functional
- [ ] Project List: create projects, view status, navigate to detail
- [ ] Project Detail: view questions, generate answers, navigate to review/evaluation
- [ ] Question Review: review answers, update status, enter manual answers
- [ ] Document Manager: upload files, view status, see OUTDATED warnings
- [ ] Evaluation Report: compare answers, view scores, input human answers
- [ ] Request Status: track async operations, view progress, handle errors
- [ ] All user workflows are complete end-to-end
- [ ] Error handling displays user-friendly messages
- [ ] Loading states shown during async operations
- [ ] Status updates reflect in real-time (via polling)

---

## Cross-Cutting Requirements

### Error Handling
- All API endpoints return appropriate HTTP status codes
- Error messages are user-friendly and actionable
- Frontend displays errors clearly
- Backend logs errors for debugging

### Async Processing
- All long-running operations are asynchronous
- Request tracking via request_id
- Status polling mechanism
- Progress updates (0.0 to 100.0)

### Data Validation
- Input validation on all API endpoints
- Type checking (Pydantic models, TypeScript types)
- Business rule validation (e.g., status transitions)

### Testing
- Unit tests for core business logic
- Integration tests for API endpoints
- Frontend component tests
- End-to-end workflow tests

---

## Overall Acceptance Criteria Summary

### A. Documentation Completeness ✅
- [ ] All 8 scope areas have task descriptions
- [ ] Every API endpoint is documented with request/response models
- [ ] Data structures are mapped to system design
- [ ] Status transitions are explicitly documented

### B. Functional Accuracy ✅
- [ ] Complete workflow: upload → index → create project → generate answers → review → evaluation
- [ ] Answers always include: answerability + citations + confidence
- [ ] ALL_DOCS projects become OUTDATED when new docs indexed

### C. Review & Auditability ✅
- [ ] Manual edits preserved alongside AI results
- [ ] Answer status transitions explicitly described and validated

### D. Evaluation Framework ✅
- [ ] Clear comparison method (semantic similarity + keyword overlap)
- [ ] Output includes numeric score and qualitative explanation

### E. Non-Functional Requirements ✅
- [ ] Async processing and status tracking described and implemented
- [ ] Error handling, missing data, regeneration logic described and implemented

### F. Frontend UX ✅
- [ ] All core workflows implemented:
  - Create/update project
  - Review answers
  - Track background status
  - Compare AI vs human
