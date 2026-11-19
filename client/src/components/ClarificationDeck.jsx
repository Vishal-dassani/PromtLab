import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  X, 
  PanelRightClose,
  ArrowRight
} from 'lucide-react';

export default function ClarificationDeck({
  activePrompt,
  isLoading,
  onApplyAnswers,
  isOpen,
  onToggle,
  isMobile
}) {
  const [answers, setAnswers] = useState({});

  const questions = activePrompt?.version?.clarificationQuestions || [];
  const assumptions = activePrompt?.version?.assumptions || [];
  const improvements = activePrompt?.version?.improvements || [];

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (Object.keys(answers).length === 0 || isLoading) return;
    onApplyAnswers(answers);
    setAnswers({});
    if (isMobile) onToggle();
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 transition-opacity duration-200"
        />
      )}

      <aside
        className={`fixed lg:relative top-0 right-0 h-screen bg-[#0a0b11] border-l border-white/[0.08] flex flex-col z-40 transition-all duration-200 ease-out ${
          isMobile
            ? isOpen
              ? 'translate-x-0 w-80 max-w-[90vw] shadow-2xl'
              : 'translate-x-full w-80'
            : isOpen
              ? 'w-80 min-w-[20rem]'
              : 'w-0 min-w-0 border-l-0 overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between min-w-[20rem] bg-[#0a0b11]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
              <HelpCircle size={15} />
            </div>
            <span className="text-xs font-semibold text-slate-100">Smart Clarifications</span>
          </div>

          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {questions.length} pending
              </span>
            )}
            <button
              onClick={onToggle}
              title="Close panel"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] taste-btn cursor-pointer"
            >
              {isMobile ? <X size={17} /> : <PanelRightClose size={15} />}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-[20rem]">
          {!activePrompt ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
              <Sparkles size={22} className="text-slate-600 mb-1" />
              <p className="text-xs font-medium text-slate-300">No Active Specification</p>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
                Submit an objective in the studio to reveal AI-detected technical questions.
              </p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={16} />
                <span>Specification Complete</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All critical decisions are codified. You can copy the prompt or refine it further using the editor.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>Select decisions:</span>
                <span className="text-[10px] text-slate-500">{answeredCount}/{questions.length}</span>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="hairline-card rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-mono font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-xs font-medium text-slate-200 leading-snug">
                      {q.question}
                    </div>
                  </div>

                  {q.reason && (
                    <div className="text-[10px] text-slate-400 bg-white/[0.03] px-2.5 py-1.5 rounded-md border border-white/[0.06] flex items-center gap-1.5">
                      <span className="text-blue-400 font-semibold font-mono text-[9px] uppercase tracking-wider">Impact:</span>
                      <span className="truncate">{q.reason}</span>
                    </div>
                  )}

                  {/* Choice Pills with micro-press */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(q.id, 'Yes')}
                      className={`px-3 py-1 rounded-md text-[10px] font-medium taste-btn cursor-pointer ${
                        answers[q.id] === 'Yes'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(q.id, 'No')}
                      className={`px-3 py-1 rounded-md text-[10px] font-medium taste-btn cursor-pointer ${
                        answers[q.id] === 'No'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                      }`}
                    >
                      No
                    </button>
                    <input
                      type="text"
                      placeholder="Custom answer..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-md px-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={answeredCount === 0 || isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white text-xs font-semibold taste-btn cursor-pointer shadow-sm shadow-emerald-500/20"
              >
                <span>Apply Decisions ({answeredCount})</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}

          {/* Decisions & Enhancements */}
          {activePrompt && (assumptions.length > 0 || improvements.length > 0) && (
            <div className="pt-3 space-y-3.5 border-t border-white/[0.06]">
              {improvements.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 font-mono">
                    Enhancements Added
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    {improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 hairline-card p-2.5 rounded-lg">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assumptions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 font-mono">
                    Assumptions
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    {assumptions.map((ass, i) => (
                      <li key={i} className="flex items-start gap-2 hairline-card p-2.5 rounded-lg">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{ass}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
