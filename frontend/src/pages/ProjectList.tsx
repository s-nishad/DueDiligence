/**
 * Project List Page
 *
 * Displays all questionnaire projects and their current status.
 * Entry point for creating and navigating projects.
 */

import { Link } from "react-router-dom";

export default function ProjectList() {
  // TODO:
  // - Fetch list of projects
  // - Display project name, scope, and status
  // - Create new project (ALL_DOCS / SELECTED_DOCS)
  // - Navigate to project detail page
  // - Show async request status if project is processing

  return (
    <div>
      <h1>Projects</h1>
      <p>Project list page - to be implemented</p>
      <ul>
        <li>
          <Link to="/project/1">Project Alpha</Link>
          <p>Scope: ALL_DOCS</p>
          <p>Status: Processing...</p>
        </li>
        <li>
          <Link to="/project/2">Project Beta</Link>
          <p>Scope: SELECTED_DOCS</p>
          <p>Status: Completed</p>
        </li>
      </ul>
    </div>
  );
}
