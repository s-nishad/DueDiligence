import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import ProjectList from "./pages/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";
import QuestionReview from "./pages/QuestionReview";
import DocumentManager from "./pages/DocumentManager";
import EvaluationReport from "./pages/EvaluationReport";
import RequestStatus from "./pages/RequestStatus";
import "./styles/App.css";

function Navigation() {
  const location = useLocation();
  
  return (
    <nav>
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        Projects
      </Link>
      <Link
        to="/requests"
        className={location.pathname === "/requests" ? "active" : ""}
      >
        Request Status
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <main>
        <h1>Questionnaire Agent</h1>
        <Navigation />

        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:projectId/question/:questionId" element={<QuestionReview />} />
          <Route path="/documents" element={<DocumentManager />} />
          <Route path="/documents/:projectId" element={<DocumentManager />} />
          <Route path="/evaluation/:projectId" element={<EvaluationReport />} />
          <Route path="/evaluation" element={<EvaluationReport />} />
          <Route path="/requests" element={<RequestStatus />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
