import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowUp, 
  Code2, 
  Layers, 
  ShieldCheck, 
  Database,
  Cpu,
  Menu,
  HelpCircle,
  Hash,
  Terminal,
  Zap,
  CornerDownLeft
} from 'lucide-react';

const QUICK_STARTERS = [
  { 
    label: "MERN Stack Application", 
    prompt: "Build a production personal expense tracker using React, Express, MongoDB, and Tailwind with monthly analytics", 
    icon: Layers, 
    tag: "Full-Stack" 
  },
  { 
    label: "Secure Auth & Session Flow", 
    prompt: "Build an authentication service with Node.js, Express, JWT stored in HTTP-only cookies, bcrypt, and rate limiting", 
    icon: ShieldCheck, 
    tag: "Security" 
  },
  { 
    label: "PostgreSQL Database Model", 
    prompt: "Design a normalized database schema with foreign keys, compound indexes, and migration scripts for an e-commerce platform", 
    icon: Database, 
    tag: "Database" 
  },
  { 
    label: "API Refactoring Spec", 
    prompt: "Draft an engineering specification to eliminate N+1 queries and introduce Redis caching for hot product listings", 
    icon: Code2, 
    tag: "Refactor" 
  }
];

export default function MainWorkspace({
  activePrompt,
  isLoading,
  onOptimize,
  onRefineRecreate,
  onToggleSidebar,
  onToggleClarification,
  isClarificationOpen,
  isMobile
}) {
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState('development');
  const [targetModel, setTargetModel] = useState('nvidia/nemotron-3.5-lightning-30b-a3b');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');

  const questionsCount = activePrompt?.version?.clarificationQuestions?.length || 0;
  const tokenCount = editedPrompt ? Math.round(editedPrompt.split(/\s+/).length * 1.3) : 0;

  useEffect(() => {
    if (activePrompt?.version?.optimizedPrompt) {
      setEditedPrompt(activePrompt.version.optimizedPrompt);
    } else {
      setEditedPrompt('');
    }
  }, [activePrompt]);

  const hasManualEdits = activePrompt?.version?.optimizedPrompt && 
    editedPrompt !== activePrompt.version.optimizedPrompt;

  const handleInitialSubmit = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onOptimize({
      originalInput: inputValue.trim(),
      category,
      targetModel
    });
    setInputValue('');
  };

  const handleCopy = () => {
    if (!editedPrompt) return;
    navigator.clipboard.writeText(editedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRecreate = () => {
    if (!hasManualEdits || isLoading) return;
    onRefineRecreate(editedPrompt);
  };

  const handleFollowUpSubmit = (e) => {
    e?.preventDefault();
    if (!followUpInput.trim() || isLoading) return;
    const combined = `${editedPrompt}\n\n### Clarified Constraint\n${followUpInput.trim()}`;
    onRefineRecreate(combined);
    setFollowUpInput('');
  };

  return (
    <main className="flex-1 flex flex-col h-screen bg-[#08090d] overflow-hidden relative w-full">
      {/* Top Header / Equal Edge Toolbar */}
      <div className="h-14 border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-3 bg-[#0a0b11]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5 truncate">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] taste-btn cursor-pointer"
            title="Toggle Menu"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-xs">
              {activePrompt ? activePrompt.title : "New Specification"}
            </span>
            {activePrompt && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
                v{activePrompt.version.versionNumber}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {activePrompt && (
            <>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.08]">
                <Hash size={12} className="text-slate-500" />
                <span>{tokenCount} tokens</span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-slate-200 taste-btn cursor-pointer"
              >
                {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
              </button>

              {hasManualEdits && (
                <button
                  onClick={handleRecreate}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold taste-btn cursor-pointer shadow-sm shadow-blue-500/20 disabled:opacity-50"
                >
                  <RotateCcw size={13} className={isLoading ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Re-create</span>
                </button>
              )}
            </>
          )}

          {/* Clarification Drawer Button */}
          <button
            onClick={onToggleClarification}
            title={isClarificationOpen ? "Hide Questions" : "Show Questions"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border taste-btn cursor-pointer ${
              isClarificationOpen
                ? 'bg-blue-500/15 border-blue-500/35 text-blue-300'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
            }`}
          >
            <HelpCircle size={14} className={questionsCount > 0 ? "text-blue-400" : ""} />
            <span className="hidden md:inline">Clarifications</span>
            {questionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-mono font-bold">
                {questionsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
        {!activePrompt ? (
          /* ================= Mode A: Hero Entrance ================= */
          <div className="w-full max-w-2xl my-auto flex flex-col items-center text-center space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Engineering Spec Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                Turn ideas into exact instructions.
              </h1>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Most AI prompts fail because critical architectural constraints are left out. PromtLap detects what is missing, asks the decisive questions, and compiles an actionable specification.
              </p>
            </div>

            {/* Quick Starters (Cards lift 2px on hover) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
              {QUICK_STARTERS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setInputValue(item.prompt)}
                    className="p-4 rounded-xl hairline-card-lift group cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className="text-blue-400" />
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Central Input Box */}
            <div className="w-full pt-2">
              <form
                onSubmit={handleInitialSubmit}
                className="relative hairline-card rounded-2xl p-4 shadow-2xl focus-within:border-blue-500/50 transition-colors"
              >
                <textarea
                  rows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleInitialSubmit(e);
                    }
                  }}
                  placeholder="Describe your technical objective (e.g. Build me a secure login system using React and Node)..."
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-white/[0.04] text-[11px] font-medium text-slate-300 rounded-md px-2.5 py-1.5 border border-white/[0.08] focus:outline-none cursor-pointer hover:bg-white/[0.08] transition-colors"
                    >
                      <option value="development" className="bg-[#0f1118]">Development</option>
                      <option value="writing" className="bg-[#0f1118]">Technical Writing</option>
                      <option value="design" className="bg-[#0f1118]">UI/UX Architecture</option>
                      <option value="business" className="bg-[#0f1118]">Business Logic</option>
                    </select>

                    <select
                      value={targetModel}
                      onChange={(e) => setTargetModel(e.target.value)}
                      className="bg-white/[0.04] text-[11px] font-medium text-slate-300 rounded-md px-2.5 py-1.5 border border-white/[0.08] focus:outline-none cursor-pointer hover:bg-white/[0.08] transition-colors"
                    >
                      <option value="nvidia/nemotron-3.5-lightning-30b-a3b" className="bg-[#0f1118]">⚡ Nemotron 3.5 Lightning (30B)</option>
                      <option value="gpt-4o" className="bg-[#0f1118]">GPT-4o</option>
                      <option value="claude-3-5-sonnet" className="bg-[#0f1118]">Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white text-xs font-semibold taste-btn cursor-pointer shadow-sm shadow-blue-500/20 ml-auto"
                  >
                    <span>Compile</span>
                    <ArrowUp size={14} />
                  </button>
                </div>
              </form>
              <div className="hidden sm:flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-2.5 font-mono">
                <CornerDownLeft size={12} className="text-slate-600" />
                <span>Press <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded text-slate-400 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded text-slate-400 text-[10px]">Enter</kbd> to compile</span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= Mode B: Real Product Output ================= */
          <div className="w-full max-w-3xl flex flex-col flex-1 space-y-3.5">
            {/* Objective Banner */}
            <div className="hairline-card rounded-xl p-3.5 flex items-start gap-3">
              <Cpu size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs">
                <span className="font-semibold text-slate-300">Objective: </span>
                <span className="text-slate-400 font-mono">
                  {activePrompt.title}
                </span>
              </div>
            </div>

            {/* Spec Editor Canvas */}
            <div className="flex-1 flex flex-col hairline-card rounded-xl overflow-hidden shadow-2xl min-h-[340px]">
              <div className="bg-white/[0.02] border-b border-white/[0.06] px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>SPECIFICATION.md</span>
                </div>
                {hasManualEdits ? (
                  <span className="text-amber-400 font-medium">● Edited (Click Re-create to re-compile)</span>
                ) : (
                  <span className="text-slate-500">Ready to copy</span>
                )}
              </div>

              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                disabled={isLoading}
                placeholder="Compiled specification will appear here..."
                className="flex-1 w-full p-5 bg-transparent text-xs sm:text-[13px] font-mono text-slate-200 leading-relaxed focus:outline-none resize-none selection:bg-blue-600/30"
              />
            </div>

            {/* Follow-up input bar */}
            <form
              onSubmit={handleFollowUpSubmit}
              className="relative flex items-center hairline-card rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/50 transition-colors"
            >
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                disabled={isLoading}
                placeholder="Add a requirement or technical constraint (e.g. Enforce strict TypeScript types and Zod schemas)..."
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none pr-3"
              />
              <button
                type="submit"
                disabled={!followUpInput.trim() || isLoading}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white taste-btn cursor-pointer flex-shrink-0"
              >
                <ArrowUp size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
