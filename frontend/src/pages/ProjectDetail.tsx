/**
 * Project Detail Page
 *
 * Shows project information, questionnaire sections, questions, and answers.
 * Allows users to generate answers and navigate to review and evaluation.
 */

import { Link } from "react-router-dom";

export default function ProjectDetail() {
  // TODO:
  // - Fetch project info and status
  // - Fetch parsed questionnaire (sections + questions)
  // - Display answer status per question
  // - Generate all answers
  // - Navigate to question review
  // - Navigate to evaluation report

  return (
    <div>
      <h1>Project Detail</h1>
      <p>Project detail page - to be implemented</p>

      {/* docs list  */}
      <ul>
        <li>
          <p>Document 1: doc1.pdf</p>
        </li>
        <li>
          <p>Document 2: doc2.pdf</p>
        </li>
      </ul>

      <Link to="/project/1/question/1">Go to Question Review</Link>
      <br />
      <Link to="/evaluation/1">Go to Evaluation Report</Link>

      <br />
      <br />
      <Link to="/">Back to Projects</Link>
    </div>
  );
}
