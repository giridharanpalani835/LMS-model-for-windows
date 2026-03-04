// pages/student/Assignments.js — Assignments with malpractice detection + Gemini AI question generation
import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MAX_WARNINGS = 3;
const GEMINI_API_KEY = 'AIzaSyDE9IL1P1kGFUyfIHUphK1ttGv-XGlveVQ';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — Light / Editorial theme
// ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#f8f7f4',
  white:      '#ffffff',
  surface:    '#ffffff',
  surfaceAlt: '#f4f3f0',
  border:     '#e2e0da',
  borderMid:  '#ccc9c1',
  ink:        '#0f0e0c',
  inkMid:     '#3d3c39',
  inkLight:   '#6e6c67',
  inkFaint:   '#a8a5a0',
  indigo:     '#3730a3',
  indigoDim:  '#eef2ff',
  indigoBrd:  '#c7d2fe',
  terra:      '#b45309',
  terraDim:   '#fffbeb',
  terraBrd:   '#fde68a',
  green:      '#15803d',
  greenDim:   '#f0fdf4',
  greenBrd:   '#bbf7d0',
  red:        '#b91c1c',
  redDim:     '#fef2f2',
  redBrd:     '#fecaca',
  violet:     '#6d28d9',
  rSm: '4px',
  rMd: '8px',
  rLg: '12px',
  rXl: '16px',
  font: "'Playfair Display', 'Georgia', serif",
  sans: "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
    @keyframes shimmer { 0% { background-position:-600px 0; } 100% { background-position:600px 0; } }
    @keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
    @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes spin    { to { transform:rotate(360deg); } }

    .asgn-root {
      font-family: ${T.sans};
      color: ${T.ink};
      min-height: 100vh;
      background: ${T.bg};
      padding: 2.5rem 2.25rem 5rem;
    }
    .asgn-root ::-webkit-scrollbar { width: 4px; }
    .asgn-root ::-webkit-scrollbar-track { background: transparent; }
    .asgn-root ::-webkit-scrollbar-thumb { background: ${T.borderMid}; border-radius: 99px; }

    /* PAGE HEADER */
    .ph-row {
      display:flex; align-items:flex-end; justify-content:space-between;
      flex-wrap:wrap; gap:1.25rem; margin-bottom:2rem;
      padding-bottom:1.5rem; border-bottom:2px solid ${T.ink};
      animation: fadeUp 0.3s ease both;
    }
    .ph-kicker {
      font-family:${T.mono}; font-size:0.62rem; font-weight:600;
      letter-spacing:0.2em; text-transform:uppercase; color:${T.inkFaint}; margin-bottom:0.45rem;
    }
    .ph-title {
      font-family:${T.font}; font-size:clamp(1.75rem,3.5vw,2.5rem);
      font-weight:800; letter-spacing:-0.04em; color:${T.ink}; line-height:1.05;
    }
    .ph-sub { font-size:0.8rem; color:${T.inkLight}; margin-top:0.4rem; }

    /* AI BANNER */
    .ai-banner {
      display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap;
      justify-content:space-between; background:${T.indigoDim};
      border:1px solid ${T.indigoBrd}; border-left:4px solid ${T.indigo};
      border-radius:${T.rMd}; padding:1.1rem 1.4rem; margin-bottom:2rem;
      animation: fadeUp 0.35s ease 0.05s both;
    }
    .ai-banner-left { display:flex; align-items:center; gap:1rem; flex:1; min-width:0; }
    .ai-banner-icon {
      width:38px; height:38px; background:${T.indigo}; border-radius:${T.rSm};
      display:flex; align-items:center; justify-content:center;
      font-size:1.1rem; flex-shrink:0; color:white;
    }
    .ai-banner-title { font-size:0.875rem; font-weight:700; color:${T.indigo}; margin-bottom:0.15rem; }
    .ai-banner-sub { font-size:0.75rem; color:${T.inkLight}; line-height:1.5; }

    /* SECTION DIVIDER */
    .section-divider {
      display:flex; align-items:center; gap:0.85rem;
      margin-bottom:1.25rem; animation: fadeUp 0.35s ease 0.1s both;
    }
    .section-divider-label {
      font-family:${T.mono}; font-size:0.6rem; font-weight:600;
      letter-spacing:0.18em; text-transform:uppercase; color:${T.inkFaint}; white-space:nowrap;
    }
    .section-divider-line { flex:1; height:1px; background:${T.border}; }

    /* ASSIGNMENTS GRID */
    .asgn-grid {
      display:grid; grid-template-columns:repeat(auto-fill, minmax(300px,1fr));
      gap:1px; background:${T.border}; border:1px solid ${T.border};
      border-radius:${T.rLg}; overflow:hidden;
    }
    .asgn-card {
      background:${T.white}; padding:1.5rem; display:flex;
      flex-direction:column; gap:0.75rem; position:relative;
      transition:background 0.15s ease; animation: fadeUp 0.4s ease both;
    }
    .asgn-card:hover { background:${T.bg}; }
    .asgn-card::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
    }
    .asgn-card[data-type="assessment"]::before { background:${T.terra}; }
    .asgn-card[data-type="homework"]::before   { background:${T.indigo}; }
    .asgn-card:nth-child(1){animation-delay:0.04s}
    .asgn-card:nth-child(2){animation-delay:0.08s}
    .asgn-card:nth-child(3){animation-delay:0.12s}
    .asgn-card:nth-child(4){animation-delay:0.16s}
    .asgn-card:nth-child(5){animation-delay:0.20s}
    .asgn-card-badges { display:flex; align-items:center; gap:0.4rem; }
    .asgn-card-title {
      font-family:${T.font}; font-size:1.05rem; font-weight:700;
      color:${T.ink}; line-height:1.3; letter-spacing:-0.02em;
    }
    .asgn-card-desc { font-size:0.8rem; color:${T.inkLight}; line-height:1.65; flex:1; }
    .asgn-card-footer {
      display:flex; flex-direction:column; gap:0.5rem;
      padding-top:0.75rem; border-top:1px solid ${T.border};
    }
    .asgn-meta-row {
      display:flex; align-items:center; justify-content:space-between;
      font-family:${T.mono}; font-size:0.68rem; color:${T.inkFaint}; letter-spacing:0.02em;
    }

    /* BADGES */
    .badge {
      display:inline-flex; align-items:center; gap:0.25rem;
      font-family:${T.mono}; font-size:0.58rem; font-weight:600;
      letter-spacing:0.1em; text-transform:uppercase;
      padding:0.18rem 0.55rem; border-radius:2px; white-space:nowrap; border:1px solid;
    }
    .badge-assessment { background:${T.terraDim}; color:${T.terra}; border-color:${T.terraBrd}; }
    .badge-homework   { background:${T.indigoDim}; color:${T.indigo}; border-color:${T.indigoBrd}; }
    .badge-neutral    { background:${T.surfaceAlt}; color:${T.inkLight}; border-color:${T.border}; }
    .badge-success    { background:${T.greenDim}; color:${T.green}; border-color:${T.greenBrd}; }
    .badge-ai         { background:#f5f3ff; color:${T.violet}; border-color:#ddd6fe; }

    /* NOTICES */
    .proctor-notice {
      background:${T.terraDim}; border:1px solid ${T.terraBrd};
      border-left:3px solid ${T.terra}; border-radius:${T.rSm};
      padding:0.55rem 0.75rem; font-size:0.72rem; color:${T.terra}; line-height:1.5;
    }
    .submitted-state {
      display:flex; align-items:center; gap:0.5rem;
      padding:0.6rem 0.8rem; background:${T.greenDim};
      border:1px solid ${T.greenBrd}; border-radius:${T.rSm};
      font-family:${T.mono}; font-size:0.75rem; font-weight:600; color:${T.green};
    }
    .empty-state {
      grid-column:1/-1; padding:4rem 2rem; text-align:center;
      color:${T.inkFaint}; font-size:0.875rem; background:${T.white};
    }

    /* BUTTONS */
    .btn {
      display:inline-flex; align-items:center; justify-content:center;
      gap:0.4rem; font-family:${T.sans}; font-weight:700;
      font-size:0.78rem; border:none; border-radius:${T.rSm};
      cursor:pointer; transition:all 0.15s ease;
      white-space:nowrap; outline:none; letter-spacing:0.01em;
    }
    .btn:disabled { opacity:0.4; cursor:not-allowed; }
    .btn-primary { background:${T.ink}; color:${T.white}; padding:0.6rem 1.2rem; }
    .btn-primary:not(:disabled):hover { background:${T.inkMid}; transform:translateY(-1px); box-shadow:0 4px 16px rgba(15,14,12,0.18); }
    .btn-secondary { background:${T.white}; color:${T.ink}; border:1.5px solid ${T.border}; padding:0.6rem 1.1rem; }
    .btn-secondary:not(:disabled):hover { border-color:${T.inkMid}; background:${T.bg}; }
    .btn-indigo { background:${T.indigo}; color:white; padding:0.6rem 1.2rem; }
    .btn-indigo:not(:disabled):hover { background:#312e81; transform:translateY(-1px); box-shadow:0 4px 16px rgba(55,48,163,0.3); }
    .btn-danger { background:${T.red}; color:white; padding:0.6rem 1.2rem; }
    .btn-danger:not(:disabled):hover { background:#991b1b; }
    .btn-block { width:100%; }
    .btn-lg { padding:0.75rem 1.5rem; font-size:0.875rem; }
    .btn-sm { padding:0.3rem 0.65rem; font-size:0.7rem; }

    .spinner {
      width:14px; height:14px;
      border:2px solid rgba(255,255,255,0.25);
      border-top-color:rgba(255,255,255,0.85);
      border-radius:50%; animation:spin 0.65s linear infinite; display:inline-block;
    }

    /* MALPRACTICE */
    .malpractice-banner {
      position:fixed; top:0; left:0; right:0; background:${T.red}; color:white;
      text-align:center; padding:0.55rem 1rem; font-family:${T.mono};
      font-size:0.72rem; font-weight:600; letter-spacing:0.06em; z-index:999;
    }

    /* WARNING MODAL */
    .warn-overlay {
      position:fixed; inset:0; background:rgba(15,14,12,0.6);
      display:flex; align-items:center; justify-content:center;
      z-index:9999; backdrop-filter:blur(4px); animation:fadeIn 0.2s ease;
    }
    .warn-card {
      background:${T.white}; border:2px solid ${T.red}; border-radius:${T.rLg};
      padding:2.5rem 2rem; width:min(440px,calc(100vw - 2rem));
      text-align:center; box-shadow:0 20px 60px rgba(15,14,12,0.2);
      animation:shake 0.35s ease;
    }
    .warn-icon-ring {
      width:60px; height:60px; border-radius:50%;
      border:2px solid ${T.redBrd}; background:${T.redDim};
      display:flex; align-items:center; justify-content:center;
      font-size:1.5rem; margin:0 auto 1.25rem; color:${T.red};
    }
    .warn-title {
      font-family:${T.font}; font-size:1.3rem; font-weight:700;
      color:${T.red}; letter-spacing:-0.03em; margin-bottom:0.65rem;
    }
    .warn-msg { font-size:0.875rem; color:${T.inkMid}; line-height:1.65; margin-bottom:1rem; }
    .warn-counter {
      display:inline-flex; align-items:center; font-family:${T.mono};
      font-size:0.7rem; font-weight:600; background:${T.redDim};
      border:1px solid ${T.redBrd}; color:${T.red}; padding:0.25rem 0.8rem;
      border-radius:2px; margin-bottom:0.5rem; letter-spacing:0.08em;
    }
    .warn-sub { font-size:0.75rem; color:${T.inkFaint}; margin-bottom:1.5rem; }

    /* PROCTOR BADGE */
    .proctor-badge {
      display:flex; align-items:center; gap:0.45rem;
      background:${T.redDim}; border:1px solid ${T.redBrd}; border-radius:2px;
      padding:0.25rem 0.75rem; font-family:${T.mono};
      font-size:0.62rem; font-weight:600; color:${T.red};
      letter-spacing:0.08em; text-transform:uppercase;
    }
    .proctor-dot {
      width:6px; height:6px; border-radius:50%; background:${T.red};
      animation:blink 1.2s ease-in-out infinite; flex-shrink:0;
    }

    /* QUIZ */
    .quiz-wrap { max-width:800px; animation:fadeUp 0.3s ease both; }
    .quiz-top-bar {
      display:flex; align-items:center; gap:1rem; flex-wrap:wrap;
      margin-bottom:2rem; padding-bottom:1.25rem; border-bottom:2px solid ${T.ink};
    }
    .quiz-title {
      font-family:${T.font}; font-size:1.2rem; font-weight:700;
      color:${T.ink}; letter-spacing:-0.03em; flex:1; min-width:0;
    }
    .questions-stack {
      display:flex; flex-direction:column; gap:1px;
      background:${T.border}; border:1px solid ${T.border};
      border-radius:${T.rMd}; overflow:hidden; margin-bottom:1.5rem;
    }
    .question-card { background:${T.white}; padding:1.5rem; }
    .question-num {
      font-family:${T.mono}; font-size:0.6rem; font-weight:600;
      letter-spacing:0.15em; text-transform:uppercase; color:${T.inkFaint};
      margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;
    }
    .question-text {
      font-size:0.9rem; font-weight:500; color:${T.ink};
      line-height:1.7; margin-bottom:1rem;
    }
    .marks-badge {
      display:inline-flex; align-items:center; font-family:${T.mono};
      font-size:0.6rem; font-weight:600; letter-spacing:0.06em;
      color:${T.terra}; background:${T.terraDim}; border:1px solid ${T.terraBrd};
      padding:0.1rem 0.5rem; border-radius:2px; margin-left:0.5rem; vertical-align:middle;
    }

    /* OPTIONS */
    .options-stack { display:flex; flex-direction:column; gap:0.4rem; }
    .option-row {
      display:flex; align-items:center; gap:0.75rem;
      padding:0.7rem 0.9rem; background:${T.bg};
      border:1px solid ${T.border}; border-radius:${T.rSm};
      cursor:pointer; transition:all 0.12s ease;
      font-size:0.85rem; color:${T.inkMid}; user-select:none;
    }
    .option-row input[type="radio"] { display:none; }
    .option-row:hover:not(.opt-disabled) { border-color:${T.inkMid}; background:${T.white}; color:${T.ink}; }
    .option-row.selected { border-color:${T.indigo}; background:${T.indigoDim}; color:${T.indigo}; font-weight:600; }
    .option-row.opt-correct { border-color:${T.green}; background:${T.greenDim}; color:${T.green}; font-weight:600; }
    .option-row.opt-wrong { border-color:${T.red}; background:${T.redDim}; color:${T.red}; }
    .opt-indicator {
      width:22px; height:22px; border-radius:50%; border:1.5px solid ${T.borderMid};
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
      font-family:${T.mono}; font-size:0.62rem; font-weight:700;
      color:${T.inkFaint}; transition:all 0.12s ease;
    }
    .option-row.selected    .opt-indicator { background:${T.indigo}; border-color:${T.indigo}; color:white; }
    .option-row.opt-correct .opt-indicator { background:${T.green}; border-color:${T.green}; color:white; }
    .option-row.opt-wrong   .opt-indicator { background:${T.red}; border-color:${T.red}; color:white; }
    .opt-right-tag {
      margin-left:auto; font-family:${T.mono};
      font-size:0.6rem; font-weight:700; letter-spacing:0.08em;
    }

    /* OPEN ANSWER */
    .open-answer {
      width:100%; background:${T.bg}; border:1px solid ${T.border};
      border-radius:${T.rSm}; padding:0.85rem 1rem; color:${T.ink};
      font-family:${T.sans}; font-size:0.875rem; line-height:1.65;
      resize:vertical; min-height:100px; transition:border-color 0.12s ease, box-shadow 0.12s ease;
    }
    .open-answer:focus {
      outline:none; border-color:${T.indigo};
      box-shadow:0 0 0 3px ${T.indigoDim}; background:${T.white};
    }

    /* EXPLANATION */
    .explanation-block {
      margin-top:0.85rem; padding:0.6rem 0.85rem;
      background:#faf5ff; border-left:3px solid ${T.violet};
      border-radius:0 ${T.rSm} ${T.rSm} 0;
      font-size:0.775rem; color:#5b21b6; line-height:1.65; font-style:italic;
    }

    /* SCORE CARD */
    .score-card {
      display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;
      background:${T.white}; border:1px solid ${T.border};
      border-radius:${T.rMd}; padding:1.5rem; margin-bottom:1.5rem;
    }
    .score-main {
      font-family:${T.mono}; font-size:2.5rem; font-weight:600;
      letter-spacing:-0.04em; line-height:1;
    }
    .score-label { font-size:0.875rem; font-weight:700; color:${T.ink}; margin-bottom:0.15rem; }
    .score-sub { font-size:0.72rem; color:${T.inkLight}; }

    /* AI MODAL */
    .modal-overlay {
      position:fixed; inset:0; background:rgba(15,14,12,0.55);
      display:flex; align-items:center; justify-content:center;
      z-index:9000; backdrop-filter:blur(6px); animation:fadeIn 0.2s ease;
    }
    .ai-modal {
      background:${T.white}; border:1px solid ${T.border};
      border-radius:${T.rXl}; padding:2rem;
      width:min(560px,calc(100vw - 2rem)); max-height:90vh; overflow-y:auto;
      box-shadow:0 24px 64px rgba(15,14,12,0.18); animation:fadeUp 0.2s ease;
    }
    .ai-modal-head {
      display:flex; align-items:flex-start; justify-content:space-between;
      gap:1rem; padding-bottom:1.25rem; margin-bottom:1.5rem;
      border-bottom:1px solid ${T.border};
    }
    .ai-modal-icon {
      width:40px; height:40px; background:${T.indigo}; border-radius:${T.rSm};
      display:flex; align-items:center; justify-content:center;
      color:white; font-size:1.1rem; flex-shrink:0;
    }
    .ai-modal-title {
      font-family:${T.font}; font-size:1.2rem; font-weight:700;
      color:${T.ink}; letter-spacing:-0.03em;
    }
    .ai-modal-sub {
      font-family:${T.mono}; font-size:0.63rem;
      color:${T.inkFaint}; letter-spacing:0.06em; margin-top:0.2rem;
    }

    /* FORM */
    .form-stack { display:flex; flex-direction:column; gap:1rem; }
    .form-group { display:flex; flex-direction:column; gap:0.4rem; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
    .form-label {
      font-family:${T.mono}; font-size:0.62rem; font-weight:600;
      letter-spacing:0.1em; text-transform:uppercase; color:${T.inkLight};
    }
    .form-input, .form-select {
      background:${T.bg}; border:1px solid ${T.border};
      border-radius:${T.rSm}; padding:0.65rem 0.9rem; color:${T.ink};
      font-family:${T.sans}; font-size:0.875rem;
      transition:border-color 0.12s ease, box-shadow 0.12s ease; outline:none;
    }
    .form-input::placeholder { color:${T.inkFaint}; }
    .form-input:focus, .form-select:focus {
      border-color:${T.indigo}; box-shadow:0 0 0 3px ${T.indigoDim}; background:${T.white};
    }
    .form-select { appearance:none; cursor:pointer; }

    /* AI PREVIEW */
    .ai-preview-wrap { margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid ${T.border}; }
    .ai-preview-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .ai-preview-title {
      font-size:0.82rem; font-weight:700; color:${T.green};
      display:flex; align-items:center; gap:0.35rem;
    }
    .ai-q-scroll {
      max-height:300px; overflow-y:auto;
      display:flex; flex-direction:column; gap:0.5rem;
    }
    .ai-q-card {
      background:${T.bg}; border:1px solid ${T.border};
      border-radius:${T.rSm}; padding:0.9rem;
    }
    .ai-q-text { font-size:0.83rem; color:${T.ink}; line-height:1.55; margin-bottom:0.5rem; }
    .ai-options-mini { display:flex; flex-direction:column; gap:0.22rem; }
    .ai-opt-mini {
      font-size:0.75rem; padding:0.22rem 0.55rem;
      border-radius:2px; border:1px solid ${T.border}; color:${T.inkLight};
    }
    .ai-opt-mini.correct {
      border-color:${T.greenBrd}; background:${T.greenDim}; color:${T.green}; font-weight:600;
    }
    .ai-preview-actions { display:flex; gap:0.6rem; justify-content:flex-end; margin-top:1rem; }

    /* SKELETON */
    .skel {
      border-radius:${T.rMd};
      background:linear-gradient(90deg,${T.border} 25%,${T.surfaceAlt} 50%,${T.border} 75%);
      background-size:600px 100%; animation:shimmer 1.4s infinite linear;
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
// GEMINI API
// ─────────────────────────────────────────────────────────────
const generateQuestionsWithGemini = async (topic, numQuestions = 5, difficulty = 'medium') => {
  const marksPerQ = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
  const prompt = `Generate ${numQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty level for students.

You MUST return ONLY a raw JSON array. No markdown, no backticks, no code blocks, no explanation text before or after. Just the JSON array itself starting with [ and ending with ].

Example format:
[{"text":"What is 2+2?","options":["3","4","5","6"],"correctOption":1,"marks":${marksPerQ},"explanation":"2+2 equals 4"}]

Now generate ${numQuestions} questions about "${topic}":`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`Gemini API error ${res.status}: ${errBody?.error?.message || 'Unknown error'}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Empty response from Gemini');

  let jsonStr = text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const startIdx = jsonStr.indexOf('[');
  const endIdx   = jsonStr.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1) throw new Error('No JSON array found in Gemini response');

  jsonStr = jsonStr.slice(startIdx, endIdx + 1);
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Gemini returned empty questions');
  return parsed;
};

// ─────────────────────────────────────────────────────────────
// AI GENERATOR MODAL
// ─────────────────────────────────────────────────────────────
const AIGeneratorModal = ({ onClose, onGenerated }) => {
  const [topic, setTopic]               = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty]     = useState('medium');
  const [generating, setGenerating]     = useState(false);
  const [preview, setPreview]           = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error('Please enter a topic');
    setGenerating(true);
    setPreview(null);
    try {
      const questions = await generateQuestionsWithGemini(topic, numQuestions, difficulty);
      setPreview(questions);
      toast.success(`${questions.length} questions generated`);
    } catch (err) {
      toast.error('Generation failed — check your Gemini API key');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>

        <div className="ai-modal-head">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div className="ai-modal-icon">✦</div>
            <div>
              <div className="ai-modal-title">AI Question Generator</div>
              <div className="ai-modal-sub">POWERED BY GOOGLE GEMINI</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="form-stack">
          <div className="form-group">
            <label className="form-label">Topic / Subject</label>
            <input
              className="form-input"
              placeholder="e.g. Photosynthesis, Python Functions, World War II…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              autoFocus
              textcolor='black'
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Number of Questions</label>
              <select className="form-select" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))}>
                {[3, 5, 8, 10, 15].map((n) => <option key={n} value={n}>{n} Questions</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select className="form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <button className="btn btn-indigo btn-block" onClick={handleGenerate} disabled={generating}>
            {generating
              ? <><span className="spinner" /> Generating questions…</>
              : '✦ Generate Questions'}
          </button>
        </div>

        {preview && (
          <div className="ai-preview-wrap">
            <div className="ai-preview-head">
              <div className="ai-preview-title">✓ {preview.length} Questions Ready</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>Clear</button>
            </div>
            <div className="ai-q-scroll">
              {preview.map((q, i) => (
                <div key={i} className="ai-q-card">
                  <div className="ai-q-text">
                    <span style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.inkFaint }}>Q{i + 1} </span>
                    {q.text}
                    <span className="marks-badge">{q.marks} pts</span>
                  </div>
                  <div className="ai-options-mini">
                    {q.options.map((opt, j) => (
                      <div key={j} className={`ai-opt-mini ${j === q.correctOption ? 'correct' : ''}`}>
                        {j === q.correctOption && '✓ '}{opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="explanation-block" style={{ marginTop: '0.5rem' }}>{q.explanation}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="ai-preview-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleGenerate} disabled={generating}>
                ↺ Regenerate
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { onGenerated(preview, topic); onClose(); }}
              >
                Start Practice →
              </button>
            </div>
          </div>
        )}

        {!preview && (
          <button className="btn btn-secondary btn-block" onClick={onClose} style={{ marginTop: '0.85rem' }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PRACTICE MODE
// ─────────────────────────────────────────────────────────────
const PracticeMode = ({ questions, topic, onClose }) => {
  const [answers, setAnswers]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]         = useState(null);

  const handleAnswer = (idx, optionIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [idx]: optionIdx }));
  };

  const handleSubmit = () => {
    let earned = 0, total = 0;
    questions.forEach((q, i) => {
      total += q.marks;
      if (answers[i] === q.correctOption) earned += q.marks;
    });
    const pct = total ? Math.round((earned / total) * 100) : 0;
    setScore({ earned, total, pct });
    setSubmitted(true);
  };

  const gradeColor = (pct) =>
    pct >= 80 ? T.green : pct >= 60 ? T.indigo : pct >= 40 ? T.terra : T.red;

  const gradeLabel = (pct) =>
    pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good Effort' : pct >= 40 ? 'Keep Practicing' : 'Needs Work';

  const optionLetter = (i) => ['A', 'B', 'C', 'D', 'E'][i] || String(i);

  return (
    <div className="quiz-wrap">
      <div className="quiz-top-bar">
        <button className="btn btn-secondary" onClick={onClose}>← Back</button>
        <div className="quiz-title">Practice: {topic}</div>
        <span className="badge badge-ai">AI Generated</span>
      </div>

      {submitted && score && (
        <div className="score-card" style={{ borderLeft: `4px solid ${gradeColor(score.pct)}` }}>
          <div className="score-main" style={{ color: gradeColor(score.pct) }}>
            {score.earned}<span style={{ fontSize: '1.3rem', color: T.inkFaint }}>/{score.total}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div className="score-label">{score.pct}% — {gradeLabel(score.pct)}</div>
            <div className="score-sub">Practice session complete</div>
          </div>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      )}

      <div className="questions-stack">
        {questions.map((q, idx) => {
          const userAns   = answers[idx];
          const isCorrect = submitted && userAns === q.correctOption;
          const isWrong   = submitted && userAns !== undefined && !isCorrect;

          return (
            <div key={idx} className="question-card" style={{
              borderLeft: submitted
                ? `3px solid ${isCorrect ? T.green : isWrong ? T.red : T.border}`
                : '3px solid transparent'
            }}>
              <div className="question-num">
                Question {idx + 1}
                {submitted && (
                  <span>{isCorrect ? '· Correct' : isWrong ? '· Incorrect' : '· Not answered'}</span>
                )}
              </div>
              <div className="question-text">
                {q.text}
                <span className="marks-badge">{q.marks} pts</span>
              </div>

              <div className="options-stack">
                {q.options.map((opt, i) => {
                  let cls = 'option-row';
                  if (userAns === i) cls += ' selected';
                  if (submitted && i === q.correctOption)                  cls = 'option-row opt-correct';
                  if (submitted && userAns === i && i !== q.correctOption) cls = 'option-row opt-wrong';
                  if (submitted) cls += ' opt-disabled';

                  return (
                    <label key={i} className={cls} onClick={() => handleAnswer(idx, i)}>
                      <input type="radio" name={`p-${idx}`} checked={userAns === i} onChange={() => handleAnswer(idx, i)} disabled={submitted} />
                      <div className="opt-indicator">{optionLetter(i)}</div>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {submitted && i === q.correctOption && (
                        <span className="opt-right-tag" style={{ color: T.green }}>Correct Answer</span>
                      )}
                    </label>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className="explanation-block">{q.explanation}</div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0}
        >
          Submit Practice
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [answers, setAnswers]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState({});

  const [warnings, setWarnings]                 = useState(0);
  const [malpractice, setMalpractice]           = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage]     = useState('');
  const [isFullscreen, setIsFullscreen]         = useState(false);
  const warningsRef = useRef(0);

  const [showAIModal, setShowAIModal]   = useState(false);
  const [practiceMode, setPracticeMode] = useState(null);

  useEffect(() => {
    studentAPI.getAssignments()
      .then(({ data }) => setAssignments(data.assignments))
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false));
  }, []);

  const triggerWarning = useCallback((reason) => {
    if (malpractice) return;
    warningsRef.current += 1;
    setWarnings(warningsRef.current);
    setWarningMessage(reason);
    setShowWarningModal(true);
    if (warningsRef.current >= MAX_WARNINGS) {
      setMalpractice(true);
      setShowWarningModal(false);
      toast.error('Test auto-submitted due to malpractice');
      handleAutoSubmit();
    }
  }, [malpractice]);

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    setIsFullscreen(false);
  };

  useEffect(() => {
    if (!selected) return;
    const onVis   = () => { if (document.hidden) triggerWarning('You switched tabs or minimized the window.'); };
    const onBlur  = () => triggerWarning('You left the test window.');
    const onFS    = () => {
      const inFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!inFS && isFullscreen) { triggerWarning('You exited fullscreen.'); setIsFullscreen(false); }
    };
    const onCtx   = (e) => { e.preventDefault(); triggerWarning('Right-clicking is not allowed.'); };
    const onCopy  = (e) => { e.preventDefault(); triggerWarning('Copying is not allowed.'); };
    const onPaste = (e) => { e.preventDefault(); triggerWarning('Pasting is not allowed.'); };
    const onKey   = (e) => {
      if (e.altKey && e.key === 'Tab')              { e.preventDefault(); triggerWarning('Alt+Tab is not allowed.'); }
      if (e.ctrlKey && e.key === 'Tab')             { e.preventDefault(); triggerWarning('Ctrl+Tab is not allowed.'); }
      if (e.key === 'Meta')                         { e.preventDefault(); triggerWarning('System key not allowed.'); }
      if (e.key === 'F11')                            e.preventDefault();
      if (e.ctrlKey && e.key === 'w')                e.preventDefault();
      if (e.ctrlKey && e.key === 'r')               { e.preventDefault(); triggerWarning('Refreshing is not allowed.'); }
      if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); triggerWarning('DevTools are not allowed.'); }
    };
    const onResize = () => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160)
        triggerWarning('Developer tools detected.');
    };

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFS);
    document.addEventListener('webkitfullscreenchange', onFS);
    document.addEventListener('contextmenu', onCtx);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFS);
      document.removeEventListener('webkitfullscreenchange', onFS);
      document.removeEventListener('contextmenu', onCtx);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [selected, triggerWarning, isFullscreen]);

  const handleAnswer = (questionId, value, isOption = false) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: isOption
        ? { selectedOption: parseInt(value) }
        : { openAnswer: value },
    }));
  };

  const handleAutoSubmit = async () => {
    try {
      const answersArr   = Object.entries(answers).map(([qid, ans]) => ({ questionId: qid, ...ans }));
      const assignmentId = selected?._id;
      if (!assignmentId) return;
      const { data } = await studentAPI.submit({ assignmentId, answers: answersArr });
      setSubmitted((prev) => ({ ...prev, [assignmentId]: data.totalScore }));
    } catch (err) {
      console.error(err);
    } finally {
      exitFullscreen();
      setSelected(null);
      setAnswers({});
      warningsRef.current = 0;
      setWarnings(0);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([qid, ans]) => ({ questionId: qid, ...ans }));
      const { data }   = await studentAPI.submit({ assignmentId: selected._id, answers: answersArr });
      toast.success(`Submitted — Score: ${data.totalScore}`);
      setSubmitted((prev) => ({ ...prev, [selected._id]: data.totalScore }));
      exitFullscreen();
      setSelected(null);
      setAnswers({});
      warningsRef.current = 0;
      setWarnings(0);
      setMalpractice(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const startTest = (assignment) => {
    warningsRef.current = 0;
    setWarnings(0);
    setMalpractice(false);
    setSelected(assignment);
    setAnswers({});
    setTimeout(enterFullscreen, 200);
  };

  const dismissWarning = () => {
    setShowWarningModal(false);
    enterFullscreen();
  };

  const optionLetter = (i) => ['A', 'B', 'C', 'D', 'E'][i] || String(i);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="asgn-root">
          <GlobalStyles />
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="skel" style={{ height: 70 }} />
            <div className="skel" style={{ height: 80 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skel" style={{ height: 210 }} />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="asgn-root">
        <GlobalStyles />

        {showAIModal && (
          <AIGeneratorModal
            onClose={() => setShowAIModal(false)}
            onGenerated={(questions, topic) => setPracticeMode({ questions, topic })}
          />
        )}

        {showWarningModal && (
          <div className="warn-overlay">
            <div className="warn-card">
              <div className="warn-icon-ring">⚠</div>
              <div className="warn-title">Malpractice Detected</div>
              <div className="warn-msg">{warningMessage}</div>
              <div className="warn-counter">WARNING {warnings} / {MAX_WARNINGS}</div>
              <div className="warn-sub">
                {MAX_WARNINGS - warnings} more violation{MAX_WARNINGS - warnings !== 1 ? 's' : ''} will auto-submit your test.
              </div>
              <button className="btn btn-danger btn-block" onClick={dismissWarning}>
                Understood — Return to Test
              </button>
            </div>
          </div>
        )}

        {selected && warnings > 0 && !showWarningModal && (
          <div className="malpractice-banner">
            ⚠ WARNING {warnings}/{MAX_WARNINGS} — FURTHER VIOLATIONS WILL AUTO-SUBMIT YOUR TEST
          </div>
        )}

        {practiceMode ? (
          <PracticeMode
            questions={practiceMode.questions}
            topic={practiceMode.topic}
            onClose={() => setPracticeMode(null)}
          />

        ) : !selected ? (
          <>
            <div className="ph-row">
              <div>
                <div className="ph-kicker">Student Portal</div>
                <h1 className="ph-title">Assignments</h1>
                <p className="ph-sub">
                  {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} assigned to you
                </p>
              </div>
              <button className="btn btn-indigo" onClick={() => setShowAIModal(true)}>
                ✦ AI Practice Quiz
              </button>
            </div>

            <div className="ai-banner">
              <div className="ai-banner-left">
                <div className="ai-banner-icon">✦</div>
                <div>
                  <div className="ai-banner-title">Practice with AI-Generated Questions</div>
                  <div className="ai-banner-sub">
                    Enter any topic — Gemini instantly creates MCQs tailored for you
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAIModal(true)}>
                Try Now →
              </button>
            </div>

            <div className="section-divider">
              <span className="section-divider-label">Your Assignments</span>
              <div className="section-divider-line" />
            </div>

            <div className="asgn-grid">
              {assignments.length === 0 && (
                <div className="empty-state">No assignments have been assigned yet.</div>
              )}
              {assignments.map((a) => (
                <div key={a._id} className="asgn-card" data-type={a.type}>
                  <div className="asgn-card-badges">
                    <span className={`badge badge-${a.type}`}>
                      {a.type === 'assessment' ? 'Assessment' : 'Homework'}
                    </span>
                    <span className="badge badge-neutral">{a.totalMarks} pts</span>
                  </div>

                  <div className="asgn-card-title">{a.title}</div>

                  {a.description && (
                    <div className="asgn-card-desc">{a.description}</div>
                  )}

                  <div className="asgn-card-footer">
                    <div className="asgn-meta-row">
                      {a.createdBy?.name && <span>By {a.createdBy.name}</span>}
                      {a.dueDate && (
                        <span>
                          Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {a.type === 'assessment' && !submitted[a._id] && (
                      <div className="proctor-notice">
                        Proctored test. Tab switching, keyboard shortcuts, and DevTools are monitored.
                      </div>
                    )}

                    {submitted[a._id] !== undefined ? (
                      <div className="submitted-state">
                        ✓ Submitted — {submitted[a._id]} pts
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => a.type === 'assessment' ? startTest(a) : setSelected(a)}
                      >
                        {a.type === 'assessment' ? 'Start Proctored Test' : 'Open Homework'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>

        ) : (
          <div className="quiz-wrap">
            <div className="quiz-top-bar">
              {selected.type === 'homework' && (
                <button className="btn btn-secondary" onClick={() => { setSelected(null); setAnswers({}); }}>
                  ← Back
                </button>
              )}
              <div className="quiz-title">{selected.title}</div>
              {selected.type === 'assessment' && (
                <div className="proctor-badge">
                  <span className="proctor-dot" />
                  Proctored
                </div>
              )}
            </div>

            <div className="questions-stack">
              {selected.questions.map((q, idx) => (
                <div key={q._id} className="question-card">
                  <div className="question-num">Question {idx + 1}</div>
                  <div className="question-text">
                    {q.text}
                    <span className="marks-badge">{q.marks} pts</span>
                  </div>

                  {q.type === 'mcq' ? (
                    <div className="options-stack">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className={`option-row ${answers[q._id]?.selectedOption === i ? 'selected' : ''}`}
                          onClick={() => handleAnswer(q._id, i, true)}
                        >
                          <input type="radio" name={q._id} value={i} onChange={() => handleAnswer(q._id, i, true)} />
                          <div className="opt-indicator">{optionLetter(i)}</div>
                          <span style={{ flex: 1 }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="open-answer"
                      placeholder="Write your answer here…"
                      rows={4}
                      onChange={(e) => handleAnswer(q._id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <><span className="spinner" /> Submitting…</>
                : 'Submit Assignment'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;