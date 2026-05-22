import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuestionsTable from './QuestionsTable.jsx';
import DonutChart, { buildDonutData } from './DonutChart.jsx';
import DeadlinePace from './DeadlinePace.jsx';

export default function ProgressDonut({ questions, onAction }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const openSubject = searchParams.get('subject');

  const data = useMemo(() => buildDonutData(questions), [questions]);

  const modalSubject = openSubject
    ? data.subjects.find((s) => s.subject === openSubject)
    : null;

  function openModal(subject) {
    setSearchParams({ subject }, { replace: false });
  }

  function closeModal() {
    setSearchParams({}, { replace: true });
  }

  useEffect(() => {
    if (!modalSubject) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalSubject]);

  return (
    <>
      <DonutChart
        questions={questions}
        onSliceClick={openModal}
        hint={<DeadlinePace remaining={data.total - data.practiced} />}
      />

      {modalSubject && (
        <div
          className="subject-modal-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`${modalSubject.subject} questions`}
        >
          <div
            className="subject-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="subject-modal-head">
              <div>
                <h2>{modalSubject.subject}</h2>
                <p className="muted">
                  {modalSubject.total} questions · {modalSubject.practiced} practiced
                  {modalSubject.read ? ` · ${modalSubject.read} read` : ''}
                </p>
              </div>
              <button
                type="button"
                className="ghost subject-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <div className="subject-modal-list">
              <QuestionsTable
                questions={modalSubject.questions}
                onAction={onAction}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
