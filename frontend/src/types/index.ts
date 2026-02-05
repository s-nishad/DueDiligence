// Type definitions for the Questionnaire Agent frontend

export interface Project {
  project_id: string;
  name: string;
  status: ProjectStatus;
  created_at?: string;
  updated_at?: string;
}

export type ProjectStatus = 
  | "CREATED" 
  | "INDEXING" 
  | "READY" 
  | "OUTDATED";

export interface Section {
  section_id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  question_id: string;
  text: string;
  answer?: Answer;
}

export interface Answer {
  id?: string;
  answer_id?: string; // For backward compatibility
  question_id: string;
  project_id: string;
  answer_text: string; // AI-generated answer
  text?: string; // For backward compatibility
  answerable: boolean; // Can this be answered?
  confidence: number; // 0.0 to 1.0
  citations: Citation[];
  status: AnswerStatus;
  manual_answer?: string; // Human override
  manual_text?: string; // For backward compatibility
  created_at?: string;
  updated_at?: string;
}

export type AnswerStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "REJECTED" 
  | "MANUAL_UPDATED" 
  | "MISSING_DATA";

export interface Citation {
  document_id: string;
  document_name: string;
  chunk_text: string;
  page_number?: number;
  bounding_box?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

export interface Document {
  document_id: string;
  name: string;
  status: DocumentStatus;
  scope: DocumentScope;
  indexed_at?: string;
  error?: string;
}

export type DocumentStatus = 
  | "PENDING" 
  | "INDEXING" 
  | "INDEXED" 
  | "FAILED";

export type DocumentScope = 
  | "ALL_DOCS" 
  | "SELECTED_DOCS";

export interface Request {
  request_id: string;
  status: RequestStatus;
  progress?: number;
  error?: string;
  result?: any;
  created_at?: string;
  completed_at?: string;
}

export type RequestStatus = 
  | "QUEUED" 
  | "RUNNING" 
  | "COMPLETED" 
  | "FAILED";

export interface EvaluationResult {
  question_id: string;
  question_text: string;
  ai_answer: string;
  human_answer: string;
  similarity_score: number;
  keyword_overlap: number;
  semantic_similarity: number;
}

export interface ProjectInfo {
  project_id: string;
  name: string;
  status: ProjectStatus;
  sections: Section[];
  documents: Document[];
  created_at?: string;
  updated_at?: string;
}

