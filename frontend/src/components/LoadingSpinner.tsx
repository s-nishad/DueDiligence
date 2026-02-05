import "../styles/LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

export default function LoadingSpinner({
  size = "medium",
  message,
}: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner-container">
      <div className={`spinner spinner-${size}`} />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}

