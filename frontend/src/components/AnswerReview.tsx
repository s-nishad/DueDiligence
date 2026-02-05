import type { AnswerStatus } from "../types";

/**
 * QuestionItem Component
 *
 * Displays a single questionnaire question and its current answer state.
 * Used in Project Detail page.
 */

interface QuestionItemProps {
  // TODO: Confirm questionId format and constraints
  questionId: string;
  // TODO: Define max length and formatting rules for questionText
  questionText: string;
  // TODO: Validate AnswerStatus enum values
  answerStatus?: AnswerStatus;
  // TODO: Define confidence range (0-100?) and validation rules
  confidence?: number;
  // TODO: Define callback error handling strategy
  onReview?: (questionId: string) => void;
}

export default function QuestionItem({
  questionId,
  questionText,
  answerStatus,
  confidence,
  onReview,
}: QuestionItemProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* TODO: Add proper styling/className instead of inline styles */}
      <p>
        <strong>Q:</strong> {questionText}
      </p>

      {answerStatus && (
        <p>
          {/* TODO: Map answerStatus to user-friendly display labels */}
          <strong>Status:</strong> {answerStatus}
        </p>
      )}

      {confidence !== undefined && (
        <p>
          {/* TODO: Format confidence value (e.g., as percentage) */}
          <strong>Confidence:</strong> {confidence}
        </p>
      )}

      {onReview && (
        <button onClick={() => onReview(questionId)}>
          {/* TODO: Add loading state and error handling */}
          Review Answer
        </button>
      )}
    </div>
  );
}
