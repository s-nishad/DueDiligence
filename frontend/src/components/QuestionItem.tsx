import type { AnswerStatus } from "../types";

/**
 * QuestionItem Component
 *
 * Displays a single questionnaire question and its current answer state.
 * Used in Project Detail page.
 * 
 * TODO: Connect to real data source and implement full functionality
 */

interface QuestionItemProps {
  questionId: string;
  questionText: string;
  answerStatus?: AnswerStatus;
  confidence?: number;
  onReview?: (questionId: string) => void;
}

export default function QuestionItem({
  questionId,
  questionText,
  answerStatus,
  confidence,
  onReview,
}: QuestionItemProps) {
  // TODO: Implement answer state management with real data
  // TODO: Add loading states and error handling
  
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p>
        <strong>Q:</strong> {questionText}
      </p>

      {/* TODO: Replace with styled status indicator component */}
      {answerStatus && (
        <p>
          <strong>Status:</strong> {answerStatus}
        </p>
      )}

      {/* TODO: Display confidence score with visual progress indicator */}
      {confidence !== undefined && (
        <p>
          <strong>Confidence:</strong> {confidence}
        </p>
      )}

      {/* TODO: Add confirmation dialog before review action */}
      {onReview && (
        <button onClick={() => onReview(questionId)}>
          Review Answer
        </button>
      )}
    </div>
  );
}
