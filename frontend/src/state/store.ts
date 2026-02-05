// Client state management for the Questionnaire Agent frontend

export interface AppState {
  currentProjectId: string | null;
  currentRequestId: string | null;
  projects: Map<string, any>; // Cache for project data
  requests: Map<string, any>; // Cache for request data
}

class Store {
  private state: AppState = {
    currentProjectId: null,
    currentRequestId: null,
    projects: new Map(),
    requests: new Map(),
  };

  private listeners: Set<() => void> = new Set();

  getState(): AppState {
    return { ...this.state };
  }

  setCurrentProject(projectId: string | null) {
    this.state.currentProjectId = projectId;
    this.notify();
  }

  getCurrentProject(): string | null {
    return this.state.currentProjectId;
  }

  setCurrentRequest(requestId: string | null) {
    this.state.currentRequestId = requestId;
    this.notify();
  }

  getCurrentRequest(): string | null {
    return this.state.currentRequestId;
  }

  cacheProject(projectId: string, data: any) {
    this.state.projects.set(projectId, data);
    this.notify();
  }

  getCachedProject(projectId: string): any | undefined {
    return this.state.projects.get(projectId);
  }

  cacheRequest(requestId: string, data: any) {
    this.state.requests.set(requestId, data);
    this.notify();
  }

  getCachedRequest(requestId: string): any | undefined {
    return this.state.requests.get(requestId);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const store = new Store();
