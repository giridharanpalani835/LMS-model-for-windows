// pages/teacher/TeacherAssignments.js — Create/manage assignments + questions
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI, studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap');

  :root {
    --udemy-purple: #5624d0;
    --udemy-purple-hover: #3d1a9e;
    --udemy-purple-light: #f0e9ff;
    --udemy-dark: #1c1d1f;
    --udemy-mid: #3d3d3d;
    --udemy-gray: #6a6f73;
    --udemy-border: #d1d7dc;
    --udemy-bg: #f7f9fa;
    --udemy-white: #ffffff;
    --udemy-orange: #f69c08;
    --udemy-orange-light: #fff8e7;
    --udemy-green: #1e6055;
    --udemy-green-light: #ecfdf3;
    --udemy-green-btn: #3fc88f;
    --udemy-red: #b91c1c;
    --udemy-red-light: #fef2f2;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ua-wrapper {
    font-family: 'Source Sans 3', -apple-system, sans-serif;
    background: var(--udemy-bg);
    min-height: 100vh;
    padding: 32px;
    color: var(--udemy-dark);
  }

  /* ── Page Header ── */
  .ua-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--udemy-gray);
    margin-bottom: 12px;
  }
  .ua-breadcrumb a { color: var(--udemy-purple); text-decoration: none; font-weight: 500; }
  .ua-breadcrumb a:hover { text-decoration: underline; }

  .ua-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 28px;
  }

  .ua-page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--udemy-dark);
    letter-spacing: -0.3px;
  }

  /* ── Buttons ── */
  .ua-btn-primary {
    background: var(--udemy-purple);
    color: #fff;
    border: 2px solid var(--udemy-purple);
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    border-radius: 0;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .ua-btn-primary:hover { background: var(--udemy-purple-hover); border-color: var(--udemy-purple-hover); }

  .ua-btn-ghost {
    background: transparent;
    color: var(--udemy-dark);
    border: 2px solid var(--udemy-dark);
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    border-radius: 0;
    cursor: pointer;
    transition: background 0.15s;
  }
  .ua-btn-ghost:hover { background: var(--udemy-bg); }

  .ua-btn-sm {
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    font-family: inherit;
    border-radius: 0;
    cursor: pointer;
    border: 1.5px solid var(--udemy-dark);
    background: transparent;
    color: var(--udemy-dark);
    transition: background 0.12s;
  }
  .ua-btn-sm:hover { background: var(--udemy-bg); }

  .ua-btn-sm.success {
    border-color: var(--udemy-green);
    color: var(--udemy-green);
  }
  .ua-btn-sm.success:hover { background: var(--udemy-green-light); }

  .ua-btn-sm.danger {
    border-color: var(--udemy-red);
    color: var(--udemy-red);
  }
  .ua-btn-sm.danger:hover { background: var(--udemy-red-light); }

  /* ── Form Card ── */
  .ua-form-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    padding: 28px;
    margin-bottom: 28px;
    animation: fadeSlide 0.25s ease both;
  }

  .ua-form-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--udemy-dark);
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--udemy-border);
  }

  .ua-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .ua-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .ua-form-group label {
    font-size: 13px;
    font-weight: 700;
    color: var(--udemy-dark);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .ua-form-group input,
  .ua-form-group select,
  .ua-form-group textarea {
    padding: 9px 12px;
    border: 1px solid var(--udemy-dark);
    border-radius: 0;
    font-size: 14px;
    font-family: inherit;
    color: var(--udemy-dark);
    background: var(--udemy-white);
    outline: none;
    transition: box-shadow 0.15s;
    resize: vertical;
  }

  .ua-form-group input:focus,
  .ua-form-group select:focus,
  .ua-form-group textarea:focus {
    box-shadow: 0 0 0 2px rgba(86,36,208,0.2);
    border-color: var(--udemy-purple);
  }

  /* Student checkboxes */
  .ua-student-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--udemy-border);
    background: var(--udemy-bg);
    max-height: 160px;
    overflow-y: auto;
  }

  .ua-checkbox-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    cursor: pointer;
    padding: 5px 10px;
    border: 1px solid var(--udemy-border);
    background: var(--udemy-white);
    transition: border-color 0.12s, background 0.12s;
    user-select: none;
  }

  .ua-checkbox-label:hover { border-color: var(--udemy-purple); }

  .ua-checkbox-label input[type="checkbox"]:checked + span {
    color: var(--udemy-purple);
    font-weight: 600;
  }

  .ua-checkbox-label input[type="checkbox"] { accent-color: var(--udemy-purple); }

  .ua-form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 8px;
  }

  /* ── Modal ── */
  .ua-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(28,29,31,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    padding: 20px;
    animation: fadeIn 0.15s ease;
  }

  .ua-modal-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    width: 100%;
    max-width: 560px;
    padding: 28px;
    animation: slideUp 0.2s ease both;
  }

  .ua-modal-card h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--udemy-border);
  }

  .ua-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--udemy-border);
  }

  .ua-option-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .ua-option-row input[type="radio"] { accent-color: var(--udemy-purple); flex-shrink: 0; }

  .ua-option-row input[type="text"] {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid var(--udemy-border);
    border-radius: 0;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }
  .ua-option-row input[type="text"]:focus { border-color: var(--udemy-purple); }

  .ua-correct-hint {
    font-size: 11px;
    color: var(--udemy-gray);
    margin-bottom: 8px;
  }

  /* ── Assignments List ── */
  .ua-list { display: flex; flex-direction: column; gap: 16px; }

  .ua-assignment-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    animation: fadeSlide 0.3s ease both;
    transition: box-shadow 0.15s;
  }
  .ua-assignment-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.07); }

  .ua-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px;
    flex-wrap: wrap;
  }

  .ua-card-header-left { flex: 1; min-width: 0; }

  .ua-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }

  .ua-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .ua-badge.assessment { background: var(--udemy-purple-light); color: var(--udemy-purple); }
  .ua-badge.homework   { background: var(--udemy-orange-light); color: #92400e; }
  .ua-badge.published  { background: var(--udemy-green-light); color: var(--udemy-green); }
  .ua-badge.draft      { background: #f3f4f6; color: var(--udemy-gray); }

  .ua-card-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--udemy-dark);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ua-card-meta {
    font-size: 13px;
    color: var(--udemy-gray);
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .ua-card-meta span { display: flex; align-items: center; gap: 4px; }

  .ua-card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  /* Questions preview */
  .ua-questions-list {
    border-top: 1px solid var(--udemy-border);
    background: var(--udemy-bg);
  }

  .ua-questions-header {
    padding: 10px 24px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--udemy-gray);
    border-bottom: 1px solid var(--udemy-border);
  }

  .ua-q-row {
    display: grid;
    grid-template-columns: 36px 1fr auto auto;
    align-items: center;
    gap: 12px;
    padding: 11px 24px;
    border-bottom: 1px solid var(--udemy-border);
    transition: background 0.1s;
  }
  .ua-q-row:last-child { border-bottom: none; }
  .ua-q-row:hover { background: #f0f0f0; }

  .ua-q-num {
    font-size: 11px;
    font-weight: 700;
    color: var(--udemy-white);
    background: var(--udemy-purple);
    width: 26px; height: 26px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .ua-q-text {
    font-size: 13px;
    color: var(--udemy-mid);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ua-q-marks {
    font-size: 12px;
    font-weight: 700;
    color: var(--udemy-purple);
    white-space: nowrap;
  }

  .ua-q-del {
    background: none;
    border: none;
    color: var(--udemy-gray);
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
    border-radius: 2px;
    transition: color 0.12s, background 0.12s;
    line-height: 1;
  }
  .ua-q-del:hover { color: var(--udemy-red); background: var(--udemy-red-light); }

  /* Stats bar */
  .ua-stats-row {
    display: flex;
    gap: 16px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .ua-stat-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    padding: 16px 22px;
    flex: 1;
    min-width: 130px;
    max-width: 200px;
  }

  .ua-stat-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--udemy-gray);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .ua-stat-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--udemy-dark);
  }
  .ua-stat-value.purple { color: var(--udemy-purple); }

  /* Empty / Loading */
  .ua-empty-state {
    text-align: center;
    padding: 64px 24px;
    color: var(--udemy-gray);
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
  }
  .ua-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .ua-empty-title { font-size: 18px; font-weight: 700; color: var(--udemy-dark); margin-bottom: 6px; }

  .ua-loading-text {
    text-align: center;
    padding: 40px;
    color: var(--udemy-gray);
    font-size: 15px;
  }

  /* Shimmer */
  .ua-shimmer-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ua-shimmer-bar {
    height: 14px;
    border-radius: 2px;
    background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .ua-wrapper { padding: 16px; }
    .ua-form-row { grid-template-columns: 1fr; }
    .ua-card-header { flex-direction: column; }
    .ua-q-row { grid-template-columns: 28px 1fr auto auto; }
  }
`;

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showQForm, setShowQForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const [aForm, setAForm] = useState({ title: '', description: '', type: 'assessment', dueDate: '', totalMarks: 100, assignedTo: [] });
  const [qForm, setQForm] = useState({ text: '', type: 'mcq', options: ['', '', '', ''], correctOption: 0, marks: 10 });

  useEffect(() => {
    Promise.all([teacherAPI.getAssignments(), teacherAPI.getStudents()])
      .then(([{ data: a }, { data: s }]) => { setAssignments(a.assignments); setStudents(s.students); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => teacherAPI.getAssignments().then(({ data }) => setAssignments(data.assignments));

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.createAssignment(aForm);
      toast.success('Assignment created!');
      setShowForm(false);
      setAForm({ title: '', description: '', type: 'assessment', dueDate: '', totalMarks: 100, assignedTo: [] });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating assignment');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.addQuestion({ ...qForm, assignmentId: showQForm });
      toast.success('Question added!');
      setShowQForm(null);
      setQForm({ text: '', type: 'mcq', options: ['', '', '', ''], correctOption: 0, marks: 10 });
      refresh();
    } catch (err) {
      toast.error('Error adding question');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    await teacherAPI.deleteAssignment(id);
    toast.success('Deleted');
    refresh();
  };

  const handlePublish = async (id) => {
    await teacherAPI.publishAssignment(id);
    toast.success('Published!');
    refresh();
  };

  const handleDeleteQuestion = async (qid, aid) => {
    await teacherAPI.deleteQuestion(qid);
    toast.success('Question removed');
    refresh();
  };

  const toggleStudent = (id) => {
    setAForm((f) => ({
      ...f,
      assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter((s) => s !== id) : [...f.assignedTo, id],
    }));
  };

  const publishedCount = assignments.filter((a) => a.isPublished).length;
  const totalQuestions = assignments.reduce((acc, a) => acc + (a.questions?.length || 0), 0);

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="ua-wrapper">

        {/* Breadcrumb */}
        <div className="ua-breadcrumb">
          <a href="#">Dashboard</a>
          <span>›</span>
          <span>Assignments</span>
        </div>

        {/* Title row */}
        <div className="ua-title-row">
          <h1 className="ua-page-title">Assignments</h1>
          <button className="ua-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Assignment'}
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="ua-stats-row">
            <div className="ua-stat-card">
              <div className="ua-stat-label">Total</div>
              <div className="ua-stat-value purple">{assignments.length}</div>
            </div>
            <div className="ua-stat-card">
              <div className="ua-stat-label">Published</div>
              <div className="ua-stat-value">{publishedCount}</div>
            </div>
            <div className="ua-stat-card">
              <div className="ua-stat-label">Drafts</div>
              <div className="ua-stat-value">{assignments.length - publishedCount}</div>
            </div>
            <div className="ua-stat-card">
              <div className="ua-stat-label">Questions</div>
              <div className="ua-stat-value">{totalQuestions}</div>
            </div>
          </div>
        )}

        {/* Create Assignment Form */}
        {showForm && (
          <div className="ua-form-card">
            <h3>Create New Assignment</h3>
            <form onSubmit={handleCreateAssignment}>
              <div className="ua-form-row">
                <div className="ua-form-group">
                  <label>Title</label>
                  <input
                    placeholder="e.g. Chapter 3 Quiz"
                    value={aForm.title}
                    onChange={(e) => setAForm({ ...aForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="ua-form-group">
                  <label>Type</label>
                  <select value={aForm.type} onChange={(e) => setAForm({ ...aForm, type: e.target.value })}>
                    <option value="assessment">Assessment (MCQ)</option>
                    <option value="homework">Homework (Open)</option>
                  </select>
                </div>
              </div>

              <div className="ua-form-group">
                <label>Description</label>
                <textarea
                  placeholder="Brief description of this assignment…"
                  value={aForm.description}
                  onChange={(e) => setAForm({ ...aForm, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="ua-form-row">
                <div className="ua-form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={aForm.dueDate}
                    onChange={(e) => setAForm({ ...aForm, dueDate: e.target.value })}
                  />
                </div>
                <div className="ua-form-group">
                  <label>Total Marks</label>
                  <input
                    type="number"
                    value={aForm.totalMarks}
                    onChange={(e) => setAForm({ ...aForm, totalMarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="ua-form-group">
                <label>Assign to Students ({aForm.assignedTo.length} selected)</label>
                <div className="ua-student-checkboxes">
                  {students.map((s) => (
                    <label key={s._id} className="ua-checkbox-label">
                      <input
                        type="checkbox"
                        checked={aForm.assignedTo.includes(s._id)}
                        onChange={() => toggleStudent(s._id)}
                      />
                      <span>{s.name}</span>
                    </label>
                  ))}
                  {students.length === 0 && (
                    <span style={{ fontSize: 13, color: 'var(--udemy-gray)' }}>No students enrolled yet.</span>
                  )}
                </div>
              </div>

              <div className="ua-form-footer">
                <button className="ua-btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="ua-btn-primary" type="submit">Create Assignment</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Question Modal */}
        {showQForm && (
          <div className="ua-modal-overlay" onClick={() => setShowQForm(null)}>
            <div className="ua-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Add Question</h3>
              <form onSubmit={handleAddQuestion}>
                <div className="ua-form-group">
                  <label>Question Text</label>
                  <textarea
                    placeholder="Enter your question here…"
                    value={qForm.text}
                    onChange={(e) => setQForm({ ...qForm, text: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="ua-form-row">
                  <div className="ua-form-group">
                    <label>Type</label>
                    <select value={qForm.type} onChange={(e) => setQForm({ ...qForm, type: e.target.value })}>
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="open">Open Text</option>
                    </select>
                  </div>
                  <div className="ua-form-group">
                    <label>Marks</label>
                    <input
                      type="number"
                      value={qForm.marks}
                      onChange={(e) => setQForm({ ...qForm, marks: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {qForm.type === 'mcq' && (
                  <div className="ua-form-group">
                    <label>Options</label>
                    <p className="ua-correct-hint">Select the radio button next to the correct answer.</p>
                    {qForm.options.map((opt, i) => (
                      <div key={i} className="ua-option-row">
                        <input
                          type="radio"
                          name="correct"
                          checked={qForm.correctOption === i}
                          onChange={() => setQForm({ ...qForm, correctOption: i })}
                        />
                        <input
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const opts = [...qForm.options];
                            opts[i] = e.target.value;
                            setQForm({ ...qForm, options: opts });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="ua-modal-actions">
                  <button className="ua-btn-ghost" type="button" onClick={() => setShowQForm(null)}>Cancel</button>
                  <button className="ua-btn-primary" type="submit">Add Question</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="ua-shimmer-card">
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="ua-shimmer-bar" style={{ width: 70 }} />
                  <div className="ua-shimmer-bar" style={{ width: 55 }} />
                </div>
                <div className="ua-shimmer-bar" style={{ width: '50%', height: 18 }} />
                <div className="ua-shimmer-bar" style={{ width: '30%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Assignments List */}
        {!loading && (
          <div className="ua-list">
            {assignments.length === 0 ? (
              <div className="ua-empty-state">
                <div className="ua-empty-icon">📝</div>
                <div className="ua-empty-title">No assignments yet</div>
                <div>Click "+ New Assignment" to create your first one.</div>
              </div>
            ) : (
              assignments.map((a, idx) => (
                <div
                  key={a._id}
                  className="ua-assignment-card"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="ua-card-header">
                    <div className="ua-card-header-left">
                      <div className="ua-badges">
                        <span className={`ua-badge ${a.type}`}>{a.type}</span>
                        <span className={`ua-badge ${a.isPublished ? 'published' : 'draft'}`}>
                          {a.isPublished ? '✓ Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="ua-card-title">{a.title}</div>
                      <div className="ua-card-meta">
                        <span>📋 {a.questions?.length || 0} questions</span>
                        <span>👥 {a.assignedTo?.length || 0} students</span>
                        <span>🏆 {a.totalMarks} pts</span>
                        {a.dueDate && (
                          <span>📅 Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        )}
                      </div>
                    </div>

                    <div className="ua-card-actions">
                      <button className="ua-btn-sm" onClick={() => setShowQForm(a._id)}>+ Question</button>
                      {!a.isPublished && (
                        <button className="ua-btn-sm success" onClick={() => handlePublish(a._id)}>↑ Publish</button>
                      )}
                      <button className="ua-btn-sm danger" onClick={() => handleDeleteAssignment(a._id)}>Delete</button>
                    </div>
                  </div>

                  {a.questions?.length > 0 && (
                    <div className="ua-questions-list">
                      <div className="ua-questions-header">
                        Questions ({a.questions.length})
                      </div>
                      {a.questions.map((q, i) => (
                        <div key={q._id} className="ua-q-row">
                          <div className="ua-q-num">Q{i + 1}</div>
                          <div className="ua-q-text">{q.text}</div>
                          <div className="ua-q-marks">{q.marks} pts</div>
                          <button className="ua-q-del" onClick={() => handleDeleteQuestion(q._id, a._id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignments;