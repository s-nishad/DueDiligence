import type { ProjectStatus, DocumentScope } from "../types";

/**
 * ProjectCard Component
 *
 * Reusable card for displaying a project summary.
 * Used in the Project List page.
 */

interface ProjectCardProps {
  projectId: string;
  name: string;
  status: ProjectStatus;
  scope: DocumentScope;
  onOpen?: (projectId: string) => void;
}

export default function ProjectCard({
  projectId,
  name,
  status,
  scope,
  onOpen,
}: ProjectCardProps) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <h3>{name}</h3>
      <p>
        <strong>Status:</strong> {status}
      </p>
      <p>
        <strong>Scope:</strong> {scope}
      </p>

      {onOpen && (
        <button onClick={() => onOpen(projectId)}>
          Open Project
        </button>
      )}
    </div>
  );
}
