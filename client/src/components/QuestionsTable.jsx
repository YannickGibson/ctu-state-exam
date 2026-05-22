import { useNavigate } from 'react-router-dom';
import { subjectHue } from '../config/subjects.js';
import StatusBadge from './StatusBadge.jsx';
import QuestionActions from './QuestionActions.jsx';

// Shared question list rendered by both the Questions page and the
// subject-detail modal, so the two views always have an identical design.
export default function QuestionsTable({ questions, onAction }) {
  const navigate = useNavigate();

  return (
    <table className="questions">
      <thead>
        <tr>
          <th className="col-status">Status</th>
          <th className="col-num">Subject</th>
          <th className="col-subject">#</th>
          <th>Question</th>
          <th className="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q) => (
          <tr
            key={q.id}
            className="q-row"
            onClick={() => navigate(`/questions/${q.slug}`)}
          >
            <td className="col-status">
              <StatusBadge progress={q.progress} />
            </td>
            <td className="col-num">
              <span
                className="subject-pill"
                style={{ '--subject-hue': subjectHue(q.subjectCode) }}
                title={q.subject}
              >
                {q.subjectCode} {q.subjectIndex}
              </span>
            </td>
            <td className="col-subject">
              {q.group} {q.number}
            </td>
            <td className="q-text">{q.text}</td>
            <td className="col-actions">
              <QuestionActions
                progress={q.progress}
                onAction={(action) => onAction(q.id, action)}
                compact
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
