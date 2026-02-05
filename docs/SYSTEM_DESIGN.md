# Questionnaire Agent - System Design Documentation

## Overview
This document describes the full-stack Questionnaire Agent system that ingests and indexes documents, parses questionnaire files, auto-generates answers with citations, and supports review workflows plus evaluation against human ground-truth.

---

## 1. Product & Data Model Alignment

### End-to-End Data Flow

```
User Uploads Document
    ↓
Document Indexing (Async)
    ↓
Text Extraction → Chunking → Embedding → Vector Storage
    ↓
Project Creation (with Questionnaire)
    ↓
Questionnaire Parsing → Sections & Questions
    ↓
Answer Generation (Async)
    ↓
Retrieval → LLM Generation → Citations + Confidence
    ↓
Review Workflow (Manual Override)
    ↓
Evaluation (AI vs Human Ground Truth)
```

### Data Models

#### Project
- **Purpose**: Represents a questionnaire project with associated documents and questions
- **Fields**:
  - `id: str` - Unique project identifier
  - `name: str` - Project name
  - `scope: ProjectScope` - ALL_DOCS or SELECTED_DOCS
  - `status: ProjectStatus` - CREATED, INDEXING, READY, OUTDATED
  - `document_ids: List[str]` - Associated document IDs
  - `questionnaire_file_id: Optional[str]` - Reference to questionnaire file
  - `created_at: datetime` - Creation timestamp
  - `updated_at: datetime` - Last update timestamp

#### Document
- **Purpose**: Represents an uploaded document for indexing
- **Fields**:
  - `id: str` - Unique document identifier
  - `filename: str` - Original filename
  - `indexed: bool` - Whether document has been indexed
  - `project_id: str` - Associated project ID

#### Question
- **Purpose**: Represents a question from a parsed questionnaire
- **Fields**:
  - `id: str` - Unique question identifier
  - `text: str` - Question text
  - `section_id: str` - Parent section identifier
  - `order: int` - Question order within section

#### Answer
- **Purpose**: Represents an AI-generated or manually updated answer
- **Fields**:
  - `id: str` - Unique answer identifier
  - `question_id: str` - Associated question ID
  - `project_id: str` - Associated project ID
  - `answer_text: str` - AI-generated answer text
  - `answerable: bool` - Whether question can be answered from documents
  - `confidence: float` - Confidence score (0.0 to 1.0)
  - `citations: List[Citation]` - Chunk-level citations with bounding boxes
  - `status: AnswerStatus` - PENDING, CONFIRMED, REJECTED, MANUAL_UPDATED, MISSING_DATA
  - `manual_answer: Optional[str]` - Human-provided override answer
  - `created_at: datetime` - Creation timestamp
  - `updated_at: datetime` - Last update timestamp

#### Citation
- **Purpose**: References to source document chunks
- **Fields**:
  - `document_id: str` - Source document ID
  - `document_name: str` - Source document name
  - `chunk_text: str` - The actual text chunk used
  - `page_number: Optional[int]` - Page number in source document
  - `bounding_box: Optional[dict]` - PDF coordinates {x, y, width, height}

#### Request
- **Purpose**: Tracks async operation status
- **Fields**:
  - `request_id: str` - Unique request identifier
  - `status: RequestStatus` - QUEUED, RUNNING, COMPLETED, FAILED
  - `progress: float` - Progress percentage (0.0 to 100.0)
  - `error: Optional[str]` - Error message if failed
  - `result: Optional[dict]` - Operation result data
  - `created_at: datetime` - Creation timestamp
  - `completed_at: Optional[datetime]` - Completion timestamp

### Status Transitions

#### Project Status
- `CREATED` → `INDEXING` (when documents start indexing)
- `INDEXING` → `READY` (when indexing completes)
- `READY` → `OUTDATED` (when new documents indexed for ALL_DOCS projects)
- `OUTDATED` → `INDEXING` → `READY` (when regenerated)

#### Answer Status
- `PENDING` → `CONFIRMED` (reviewer approves)
- `PENDING` → `REJECTED` (reviewer rejects)
- `PENDING` → `MANUAL_UPDATED` (reviewer provides manual answer)
- `PENDING` → `MISSING_DATA` (no relevant documents found)

#### Request Status
- `QUEUED` → `RUNNING` → `COMPLETED` (successful)
- `QUEUED` → `RUNNING` → `FAILED` (error occurred)

### API Request/Response Models

All API endpoints use Pydantic models for request/response validation:
- Request models: `CreateProjectRequest`, etc.
- Response models: Direct model dumps or structured dictionaries
- Error responses: `{"error": "message"}` format

---

## 2. Document Ingestion & Indexing

### Supported Formats
- **PDF**: Extracted using PDF parsing library (PyPDF2, pdfplumber)
- **DOCX**: Extracted using python-docx
- **XLSX**: Extracted using openpyxl
- **PPTX**: Extracted using python-pptx

### Multi-Layer Index Architecture

#### Layer 1: Answer Retrieval (Semantic Search)
- **Purpose**: Fast retrieval of relevant document sections for answer generation
- **Implementation**: 
  - Text chunks embedded using embedding model (768 dimensions)
  - Stored in vector database (VectorStore)
  - Semantic similarity search using cosine similarity
  - Returns top-k most relevant chunks

#### Layer 2: Citation Chunks with Bounding Box References
- **Purpose**: Precise citation tracking for answer verification
- **Implementation**:
  - Each chunk stores metadata:
    - Source document ID and name
    - Page number (for PDFs)
    - Bounding box coordinates (x, y, width, height) for PDF text
    - Chunk text content
  - Citations linked to specific chunks used in answer generation

### Indexing Pipeline

```
1. Document Upload
   POST /api/documents/index-document-async
   → Returns request_id for async tracking

2. Background Processing (process_document_indexing)
   a. Save file to object storage
   b. Extract text (format-specific)
   c. Chunk text (1000 chars, 100 char overlap)
   d. Generate embeddings (768-dim vectors)
   e. Store in VectorStore with metadata

3. Status Tracking
   - Request status: QUEUED → RUNNING → COMPLETED/FAILED
   - Progress updates via request_id

4. ALL_DOCS Project Marking
   - When any document is indexed, all projects with scope=ALL_DOCS
     are automatically marked as OUTDATED
   - Ensures projects regenerate with latest documents
```

### Storage Layout
- **Object Storage**: Files stored by project_id/filename
- **Vector Store**: In-memory list (can be replaced with FAISS/Chroma/Pinecone)
- **Metadata Store**: In-memory dictionaries (PROJECTS, DOCUMENTS, ANSWERS, REQUESTS)

---

## 3. Questionnaire Parsing & Project Lifecycle

### Questionnaire Parsing

#### Input
- PDF questionnaire file (e.g., ILPA Due Diligence Questionnaire)
- Uploaded via project creation or separate endpoint

#### Parsing Process
1. **Text Extraction**: Extract all text from PDF
2. **Section Identification**: 
   - Identify section headers (numbered or bold text)
   - Extract section titles
3. **Question Extraction**:
   - Identify question patterns (numbered lists, bullet points)
   - Extract question text
   - Maintain ordering within sections
4. **Structured Output**:
   ```json
   {
     "sections": [
       {
         "section_id": "sec1",
         "title": "General Information",
         "order": 1,
         "questions": [
           {
             "id": "q1",
             "text": "What is the legal name?",
             "order": 1
           }
         ]
       }
     ]
   }
   ```

### Project Lifecycle

#### Creation (Async)
```
POST /api/projects/create-project
Request: {name, scope}
Response: {project_id, status: CREATED}

1. Create project with CREATED status
2. If questionnaire file provided:
   a. Parse questionnaire (async)
   b. Extract sections and questions
   c. Store in project metadata
3. Return project_id immediately
```

#### Updating
```
POST /api/projects/update-project-async
Request: {project_id, name?, scope?}
Response: {project_id, status: OUTDATED}

1. Update project fields
2. Mark project as OUTDATED
3. Trigger regeneration if needed
```

#### Automatic Regeneration
- **Trigger**: When project configuration changes (scope, documents)
- **Process**:
  1. Project status → OUTDATED
  2. User can trigger regeneration
  3. Re-index documents if needed
  4. Re-generate all answers
  5. Status → READY

---

## 4. Answer Generation with Citations & Confidence

### Answer Generation Behavior

#### Process
1. **Question Embedding**: Generate embedding for question text
2. **Semantic Retrieval**: Search vector store for top-k relevant chunks
3. **Answerability Check**: 
   - If no relevant chunks found → `answerable=False`, `status=MISSING_DATA`
   - If chunks found → `answerable=True`
4. **Context Assembly**: Combine top chunks into context
5. **LLM Generation**: 
   - Prompt: "Answer the question using the context below..."
   - Generate answer text
6. **Citation Extraction**: 
   - Map answer to source chunks
   - Extract bounding boxes and page numbers
7. **Confidence Calculation**:
   - Base confidence: 0.6
   - Add 0.1 per relevant chunk (max 1.0)
   - Adjust based on semantic similarity scores

#### Required Fields
- **answerable: bool** - Indicates if answer is possible from documents
- **citations: List[Citation]** - Chunk-level citations with:
  - Document ID and name
  - Chunk text
  - Page number
  - Bounding box (for PDFs)
- **confidence: float** - Score from 0.0 to 1.0

### Fallback Behavior

#### No Relevant Documents
```json
{
  "answerable": false,
  "answer_text": "No relevant documents found to answer this question.",
  "confidence": 0.0,
  "citations": [],
  "status": "MISSING_DATA"
}
```

#### Low Confidence
- Answers with confidence < 0.5 are flagged for review
- Status set to PENDING for manual verification

### API Endpoints
- `POST /api/answers/generate-single-answer?project_id=X&question=Y`
- `POST /api/answers/generate-all-answers?project_id=X` (with questions list in body)

---

## 5. Review & Manual Overrides

### Review Workflow

#### Status Transitions
1. **CONFIRMED**: Reviewer approves AI-generated answer
   - Status: PENDING → CONFIRMED
   - AI answer preserved in `answer_text`
   - No manual override

2. **REJECTED**: Reviewer rejects AI answer
   - Status: PENDING → REJECTED
   - AI answer preserved for auditability
   - Requires manual answer or regeneration

3. **MANUAL_UPDATED**: Reviewer provides manual answer
   - Status: PENDING → MANUAL_UPDATED
   - AI answer preserved in `answer_text`
   - Manual answer stored in `manual_answer`
   - Both preserved for comparison

4. **MISSING_DATA**: No relevant documents found
   - Status: PENDING → MISSING_DATA
   - Indicates need for additional documents

### Manual Answer Storage

#### Data Preservation
- **AI Answer**: Always preserved in `answer_text` field
- **Manual Answer**: Stored in `manual_answer` field (if provided)
- **Both Available**: Frontend can display both for comparison
- **Audit Trail**: Status transitions tracked via `updated_at` timestamp

#### API Endpoint
```
POST /api/answers/update-answer
Request: {
  answer_id: str,
  status: AnswerStatus,
  manual_text?: str
}
Response: Updated Answer object
```

### Review UI Flow
1. Display question and AI-generated answer
2. Show citations with document references
3. Display confidence score
4. Provide action buttons:
   - Confirm (→ CONFIRMED)
   - Reject (→ REJECTED)
   - Edit/Add Manual Answer (→ MANUAL_UPDATED)
5. Save status update

---

## 6. Evaluation Framework

### Comparison Method

#### Semantic Similarity
- **Model**: Sentence transformer (e.g., all-MiniLM-L6-v2)
- **Process**: 
  1. Embed both AI and human answers
  2. Calculate cosine similarity
  3. Score: 0.0 (no similarity) to 1.0 (identical meaning)

#### Keyword Overlap
- **Process**:
  1. Extract keywords from both answers (lowercase, remove stopwords)
  2. Calculate Jaccard similarity: |A ∩ B| / |A ∪ B|
  3. Score: 0.0 (no overlap) to 1.0 (identical keywords)

#### Combined Score
- **Formula**: `similarity_score = 0.7 * semantic_similarity + 0.3 * keyword_overlap`
- **Interpretation**:
  - 0.8-1.0: Excellent match
  - 0.6-0.8: Good match
  - 0.4-0.6: Partial match
  - 0.0-0.4: Poor match

### Evaluation Output

#### Per-Question Results
```json
{
  "question_id": "q1",
  "question_text": "What is the legal name?",
  "ai_answer": "The legal name is...",
  "human_answer": "The company's legal name is...",
  "similarity_score": 0.85,
  "semantic_similarity": 0.88,
  "keyword_overlap": 0.79,
  "explanation": "High semantic similarity with good keyword overlap. Answers convey same meaning with slight wording differences."
}
```

#### Aggregate Metrics
- Average similarity score across all questions
- Percentage of questions with score > 0.8
- Percentage of questions with score < 0.5
- Questions requiring attention (low scores)

### API Endpoints
- `POST /api/evaluation/compare` - Compare single answer
- `POST /api/evaluation/evaluate-project` - Evaluate entire project
- `GET /api/evaluation/report/{project_id}` - Get evaluation report

---

## 7. Optional Chat Extension

### Chat Functionality

#### Document Corpus Usage
- **Same Index**: Chat uses the same VectorStore as questionnaire answers
- **Same Retrieval**: Semantic search for relevant chunks
- **Same Citations**: Citations include document references

#### Constraints
- **Read-Only**: Chat does not modify questionnaire answers
- **Separate Context**: Chat conversations don't affect project status
- **No Answer Override**: Chat answers are not stored as project answers

#### Implementation
- Chat endpoint: `POST /api/chat/message`
- Request: `{project_id, message}`
- Response: `{answer, citations, confidence}`
- Uses same retrieval and generation pipeline as answer generation

---

## 8. Frontend Experience

### UI Screens

#### 1. Project List (`/`)
- **Purpose**: Display all projects and create new ones
- **Features**:
  - List all projects with name, scope, status
  - Status badges (CREATED, INDEXING, READY, OUTDATED)
  - Create new project button
  - Filter by status
  - Navigate to project detail

#### 2. Project Detail (`/project/:id`)
- **Purpose**: View project information, questions, and answers
- **Features**:
  - Project metadata (name, scope, status)
  - Questionnaire sections and questions
  - Answer status per question
  - Generate all answers button
  - Navigate to question review
  - Navigate to evaluation report
  - Document list

#### 3. Question Review (`/project/:id/question/:qid`)
- **Purpose**: Review and approve/reject/update answers
- **Features**:
  - Display question text
  - Display AI-generated answer
  - Show citations with document links
  - Display confidence score
  - Action buttons: Confirm, Reject, Edit
  - Manual answer input field
  - Save status update

#### 4. Document Management (`/documents`)
- **Purpose**: Upload and manage documents
- **Features**:
  - File upload (PDF, DOCX, XLSX, PPTX)
  - Document list with indexing status
  - Indexing progress indicator
  - OUTDATED project warnings
  - Delete documents

#### 5. Evaluation Report (`/evaluation/:project_id`)
- **Purpose**: Compare AI vs human answers
- **Features**:
  - Per-question comparison
  - Similarity scores (semantic + keyword)
  - Aggregate metrics
  - Highlight low-scoring questions
  - Export report

#### 6. Request Status (`/requests`)
- **Purpose**: Track async operation status
- **Features**:
  - List all requests (indexing, answer generation)
  - Status indicators (QUEUED, RUNNING, COMPLETED, FAILED)
  - Progress bars
  - Error messages
  - Retry failed operations

### User Interactions

#### Create Project
1. Click "Create Project" button
2. Enter project name
3. Select scope (ALL_DOCS or SELECTED_DOCS)
4. Optionally upload questionnaire file
5. Submit → Project created with CREATED status
6. Navigate to project detail

#### Review Answers
1. Navigate to project detail
2. Click on question → Question review page
3. Review AI answer, citations, confidence
4. Choose action:
   - Confirm → Status: CONFIRMED
   - Reject → Status: REJECTED
   - Edit → Enter manual answer → Status: MANUAL_UPDATED
5. Save → Status updated

#### Track Background Status
1. After triggering async operation (indexing, answer generation)
2. Receive request_id
3. Navigate to Request Status page
4. View progress bar and status
5. Poll for updates or use WebSocket (future)

#### Compare AI vs Human
1. Navigate to Evaluation Report
2. View per-question similarity scores
3. Review aggregate metrics
4. Identify questions needing attention
5. Export report if needed

---

## API Endpoints Summary

### Projects
- `POST /api/projects/create-project` - Create new project
- `GET /api/projects/list-projects` - List all projects
- `GET /api/projects/get-project-info?project_id=X` - Get project details
- `GET /api/projects/get-project-status?project_id=X` - Get project status
- `POST /api/projects/update-project-async?project_id=X&name=Y` - Update project

### Documents
- `POST /api/documents/index-document-async?project_id=X` - Index document (async)
- `GET /api/documents/project-documents?project_id=X` - Get project documents

### Answers
- `POST /api/answers/generate-single-answer?project_id=X&question=Y` - Generate single answer
- `POST /api/answers/generate-all-answers?project_id=X` - Generate all answers (body: questions list)
- `POST /api/answers/update-answer?answer_id=X&status=Y&manual_text=Z` - Update answer status
- `GET /api/answers/{answer_id}` - Get single answer
- `GET /api/answers/project/{project_id}` - Get all answers for project

### Requests
- `GET /api/requests/get-request-status?request_id=X` - Get request status

### Evaluation
- `POST /api/evaluation/compare` - Compare AI vs human answer
- `POST /api/evaluation/evaluate-project` - Evaluate entire project
- `GET /api/evaluation/report/{project_id}` - Get evaluation report

### Questionnaire
- `POST /api/questionnaire/parse` - Parse questionnaire file
- `GET /api/questionnaire/{project_id}` - Get parsed questionnaire

---

## Non-Functional Requirements

### Async Processing
- All long-running operations use async background tasks
- Request tracking via request_id
- Status polling via GET /api/requests/get-request-status
- Progress updates (0.0 to 100.0)

### Error Handling
- Try-catch blocks around all async operations
- Error messages stored in Request.error field
- HTTP error responses with appropriate status codes
- Frontend error display with user-friendly messages

### Missing Data Handling
- Answer generation returns `answerable=False` when no documents found
- Status set to MISSING_DATA
- Frontend displays appropriate message
- Suggests uploading more documents

### Regeneration Logic
- Projects marked OUTDATED when:
  - New documents indexed (for ALL_DOCS projects)
  - Configuration changes
- User can trigger regeneration
- Answers regenerated with latest documents
- Status transitions: OUTDATED → INDEXING → READY

---

## Acceptance Criteria Compliance

### A. Documentation Completeness ✅
- All 8 scope areas documented above
- All API endpoints explained with context
- Data structures mapped to system design

### B. Functional Accuracy ✅
- Workflow: upload → index → create project → generate answers → review → evaluation
- Answers include: answerability + citations + confidence
- ALL_DOCS projects become OUTDATED when new docs indexed

### C. Review & Auditability ✅
- Manual edits preserved alongside AI results
- Answer status transitions explicitly described

### D. Evaluation Framework ✅
- Clear comparison method (semantic similarity + keyword overlap)
- Numeric score and qualitative explanation

### E. Non-Functional Requirements ✅
- Async processing and status tracking described
- Error handling, missing data, regeneration logic described

### F. Frontend UX ✅
- All core workflows described:
  - Create/update project
  - Review answers
  - Track background status
  - Compare AI vs human
