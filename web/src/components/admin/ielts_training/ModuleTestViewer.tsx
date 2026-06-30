'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import rawQuestions from '@/data/ielts_assessment_questions.json';

type McqQuestion = { num: number; question: string; options: string[] };
const QUESTIONS = rawQuestions as Record<string, McqQuestion[]>;

const MODULE_TITLES: Record<string, string> = {
  '1': 'Home, Family & Daily Life',
  '2': 'Politics and Socio-Cultural Issues',
  '3': 'Science and Technology',
  '4': 'Environment and Energy',
  '5': 'Health and Lifestyle',
  '6': 'Education and Learning',
  '7': 'Business and Economics',
  '8': 'Arts and Media',
  '9': 'Society and Global Issues',
  '10': 'Exam Practice and Review',
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const TOTAL_SECONDS = 60 * 60; // 1 hour

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function ModuleTestViewer({ modId }: { modId: string }) {
  const modKey = `mod${modId}`;
  const questions: McqQuestion[] = QUESTIONS[modKey] ?? [];
  const title = MODULE_TITLES[modId] ?? `Module ${modId}`;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [started, setStarted] = useState(false);

  const totalPages = Math.ceil(questions.length / 10);
  const pageQuestions = questions.slice(page * 10, (page + 1) * 10);
  const answered = Object.keys(answers).length;
  const timerUrgent = timeLeft <= 300; // last 5 min

  useEffect(() => {
    if (!started || submitted) return;
    if (timeLeft <= 0) { setSubmitted(true); return; }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [started, submitted, timeLeft]);

  const handleSelect = useCallback((qNum: number, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qNum]: optIdx }));
  }, []);

  // ── Results screen ─────────────────────────────────────────────────────────
  if (submitted) {
    const score = answered;
    const pct = Math.round((score / questions.length) * 100);
    const passed = score >= Math.ceil(questions.length * 0.8);
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
            <Link
              href={`/admin/ielts_training`}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Course
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <p className="font-grotesk text-sm font-bold text-slate-900">Results — Module {modId}</p>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full font-grotesk text-4xl font-bold text-white ${passed ? 'bg-emerald-500' : 'bg-pink-500'}`}>
            {score}/{questions.length}
          </div>
          <h2 className="font-grotesk text-2xl font-bold text-slate-900">
            {passed ? 'Well done!' : 'Keep practising'}
          </h2>
          <p className="mt-2 text-slate-500">
            You answered {score} out of {questions.length} questions · {pct}%
          </p>
          <p className={`mt-1 text-sm font-semibold ${passed ? 'text-emerald-600' : 'text-pink-600'}`}>
            {passed ? 'Pass — above 80% threshold' : 'Not yet — pass mark is 24/30 (80%)'}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => { setAnswers({}); setPage(0); setSubmitted(false); setTimeLeft(TOTAL_SECONDS); setStarted(false); }}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Retake Test
            </button>
            <Link
              href={`/admin/ielts_training/module/${modId}`}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Review Lesson
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Start screen ───────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
            <Link
              href="/admin/ielts_training"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Course
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Module {modId} — Test</p>
              <h1 className="truncate font-grotesk text-base font-bold text-slate-900">{title}</h1>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pink-50">
              <svg className="h-10 w-10 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <h2 className="font-grotesk text-xl font-bold text-slate-900">Multiple Choice Test</h2>
            <p className="mt-2 text-sm text-slate-500">Module {modId} — {title}</p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-grotesk text-2xl font-bold text-slate-900">{questions.length}</p>
                <p className="mt-1 text-xs text-slate-500">Questions</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-grotesk text-2xl font-bold text-slate-900">60</p>
                <p className="mt-1 text-xs text-slate-500">Minutes</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-grotesk text-2xl font-bold text-slate-900">80%</p>
                <p className="mt-1 text-xs text-slate-500">Pass mark</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Once you start, the timer begins. You can navigate between question pages and submit when ready.
            </p>
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="mt-6 rounded-xl bg-pink-500 px-8 py-3 font-grotesk text-sm font-bold text-white transition hover:bg-pink-600"
            >
              Start Test →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link
            href="/admin/ielts_training"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Module {modId} — Test</p>
            <h1 className="truncate font-grotesk text-sm font-bold text-slate-900">{title}</h1>
          </div>
          {/* Timer */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${timerUrgent ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span className="font-grotesk text-sm font-bold tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          {/* Progress */}
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {answered}/{questions.length}
          </span>
        </div>
      </div>

      {/* Page tabs */}
      <div className="border-b border-slate-100 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                page === i ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Q{i * 10 + 1}–{Math.min((i + 1) * 10, questions.length)}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">{answered}/{questions.length} answered</span>
        </div>
      </div>

      {/* Questions */}
      <div className="mx-auto max-w-4xl space-y-4 px-6 py-8">
        {pageQuestions.map((q) => (
          <div key={q.num} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 flex items-start gap-3 text-sm font-medium leading-relaxed text-slate-800">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                {q.num}
              </span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const selected = answers[q.num] === optIdx;
                return (
                  <label
                    key={optIdx}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                      selected
                        ? 'border-pink-300 bg-pink-50 text-slate-900'
                        : 'border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${modKey}-q${q.num}`}
                      checked={selected}
                      onChange={() => handleSelect(q.num, optIdx)}
                      className="sr-only"
                    />
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition ${
                      selected ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-300 text-slate-500'
                    }`}>
                      {OPTION_LETTERS[optIdx]}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Nav */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          {page < totalPages - 1 ? (
            <button
              type="button"
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Next
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-pink-600"
            >
              Submit Test ({answered}/{questions.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
