import type {
  Project,
  ProjectInfo,
  ProjectStatus,
  Request,
  RequestStatus,
  Answer,
  AnswerStatus,
  Document,
  DocumentScope,
} from "../types";

const BASE_URL = "http://localhost:8000/api";

// Helper function for error handling
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/* ---------- Projects ---------- */

const PROJECT_BASE_URL = `${BASE_URL}/projects`;

// create project
export async function createProject(
  name: string,
  scope: DocumentScope = "ALL_DOCS"
): Promise<{ project_id: string; status: ProjectStatus }> {
  const response = await fetch(`${PROJECT_BASE_URL}/create-project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, scope }),
  });
  return handleResponse<{ project_id: string; status: ProjectStatus }>(response);
}

// create project async (for backward compatibility)
export async function createProjectAsync(
  name: string,
  scope: DocumentScope = "ALL_DOCS"
): Promise<{ project_id: string; status: ProjectStatus }> {
  return createProject(name, scope);
}

// get project info
export async function getProjectInfo(projectId: string): Promise<ProjectInfo> {
  const response = await fetch(
    `${PROJECT_BASE_URL}/get-project-info?project_id=${projectId}`
  );
  return handleResponse<ProjectInfo>(response);
}

// get project status
export async function getProjectStatus(
  projectId: string
): Promise<{ project_id: string; status: ProjectStatus }> {
  const response = await fetch(
    `${PROJECT_BASE_URL}/get-project-status?project_id=${projectId}`
  );
  return handleResponse<{ project_id: string; status: ProjectStatus }>(response);
}

// update project async
export async function updateProjectAsync(
  projectId: string,
  updates: { name?: string; scope?: DocumentScope }
): Promise<{ project_id: string; status: ProjectStatus }> {
  const params = new URLSearchParams({ project_id: projectId });
  if (updates.name) {
    params.append("name", updates.name);
  }
  const response = await fetch(`${PROJECT_BASE_URL}/update-project-async?${params.toString()}`, {
    method: "POST",
  });
  return handleResponse<{ project_id: string; status: ProjectStatus }>(response);
}

// list projects
export async function listProjects(): Promise<Project[]> {
  const response = await fetch(`${PROJECT_BASE_URL}/list-projects`);
  return handleResponse<Project[]>(response);
}


/* ---------- Answers ---------- */

const ANSWER_BASE_URL = `${BASE_URL}/answers`;

// generate single answer
export async function generateSingleAnswer(
  projectId: string,
  question: string
): Promise<Answer> {
  const params = new URLSearchParams({
    project_id: projectId,
    question: question,
  });
  const response = await fetch(`${ANSWER_BASE_URL}/generate-single-answer?${params.toString()}`, {
    method: "POST",
  });
  return handleResponse<Answer>(response);
}

// generate all answers
export async function generateAllAnswers(
  projectId: string,
  questions: string[]
): Promise<{ project_id: string; answers: Answer[] }> {
  const params = new URLSearchParams({ project_id: projectId });
  const response = await fetch(`${ANSWER_BASE_URL}/generate-all-answers?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questions),
  });
  return handleResponse<{ project_id: string; answers: Answer[] }>(response);
}

// update answer
export async function updateAnswer(
  answerId: string,
  status: AnswerStatus,
  manualText?: string
): Promise<Answer> {
  const params = new URLSearchParams({
    answer_id: answerId,
    status: status,
  });
  if (manualText) {
    params.append("manual_text", manualText);
  }
  const response = await fetch(`${ANSWER_BASE_URL}/update-answer?${params.toString()}`, {
    method: "POST",
  });
  return handleResponse<Answer>(response);
}

/* ---------- Documents ---------- */

const DOCUMENT_BASE_URL = `${BASE_URL}/documents`;

// upload and index document async
export async function indexDocumentAsync(projectId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(
    `${DOCUMENT_BASE_URL}/index-document-async?project_id=${projectId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  return handleResponse(response);

}

/* ---------- Requests ---------- */

const REQUEST_BASE_URL = `${BASE_URL}/requests`;

export async function getRequestStatus(
  requestId: string
): Promise<Request> {
  const response = await fetch(
    `${REQUEST_BASE_URL}/get-request-status?request_id=${requestId}`
  );
  return handleResponse<Request>(response);
}


/* ---------- Evaluation ---------- */

const EVALUATION_BASE_URL = `${BASE_URL}/evaluation`;

export async function compareAnswer(
  answerId: string,
  humanAnswer: string
): Promise<any> {
  const response = await fetch(`${EVALUATION_BASE_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer_id: answerId, human_answer: humanAnswer }),
  });
  return handleResponse(response);
}

export async function evaluateProject(
  projectId: string,
  humanAnswers: Record<string, string>
): Promise<any> {
  const response = await fetch(`${EVALUATION_BASE_URL}/evaluate-project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, human_answers: humanAnswers }),
  });
  return handleResponse(response);
}

export async function getEvaluationReport(projectId: string): Promise<any> {
  const response = await fetch(`${EVALUATION_BASE_URL}/report/${projectId}`);
  return handleResponse(response);
}
