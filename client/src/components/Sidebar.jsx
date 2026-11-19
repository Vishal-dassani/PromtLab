import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeft, 
  X,
  Clock,
  ChevronRight,
  LogIn,
  LogOut,
  User as UserIcon,
  Circle
} from 'lucide-react';

export default function Sidebar({
  history = [],
  activePromptId,
  onSelectPrompt,
  onNewPrompt,
  isOpen,
  onToggle,
  isMobile,
  user,
  onOpenAuth,
  onLogout,
  isBackendOnline
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (id) => {
    onSelectPrompt(id);
    if (isMobile) onToggle();
  };

  const handleNewClick = () => {
    onNewPrompt();
    if (isMobile) onToggle();
  };

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
        className={`fixed md:relative top-0 left-0 h-screen bg-[#0a0b11] border-r border-white/[0.08] transition-all duration-200 ease-out z-40 flex flex-col ${
          isMobile
            ? isOpen
              ? 'translate-x-0 w-72 max-w-[85vw] shadow-2xl'
              : '-translate-x-full w-72'
            : isOpen
              ? 'w-64 min-w-[16rem]'
              : 'w-16 min-w-[4rem]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-white/[0.08]">
          {(isOpen || isMobile) ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-500/20">
                P
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-slate-100">PromtLap</span>
                <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  Studio
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
              P
            </div>
          )}

          <button
            onClick={onToggle}
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] taste-btn cursor-pointer"
          >
            {isMobile ? (
              <X size={17} />
            ) : isOpen ? (
              <PanelLeftClose size={16} />
            ) : (
              <PanelLeft size={16} />
            )}
          </button>
        </div>

        {/* New Prompt Button */}
        <div className="p-3">
          <button
            onClick={handleNewClick}
            className={`flex items-center gap-2.5 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 taste-btn cursor-pointer group ${
              !isOpen && !isMobile ? 'justify-center px-0' : ''
            }`}
          >
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-200" />
            {(isOpen || isMobile) && <span>New Specification</span>}
          </button>
        </div>

        {/* Search Input */}
        {(isOpen || isMobile) && (
          <div className="px-3 pb-2">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {(isOpen || isMobile) && (
            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-1.5 font-mono">
              <Clock size={11} />
              <span>Recent Prompts</span>
            </div>
          )}

          {filteredHistory.map((item) => {
            const isActive = item.id === activePromptId;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={item.title}
                className={`flex items-center gap-2.5 w-full text-left rounded-lg p-2 text-xs taste-btn cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-500/10 text-white border-l-2 border-blue-500 pl-2.5 font-medium'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                } ${!isOpen && !isMobile ? 'justify-center p-2.5' : ''}`}
              >
                <MessageSquare
                  size={14}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                />
                {(isOpen || isMobile) && (
                  <div className="flex-1 truncate">
                    <div className="truncate text-slate-200 group-hover:text-white transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                      v{item.currentVersion} · {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
                {isActive && (isOpen || isMobile) && (
                  <ChevronRight size={13} className="text-blue-400/70 ml-auto" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / User Profile & Auth */}
        <div className="p-3 border-t border-white/[0.08] bg-[#08090d]/60">
          {user ? (
            /* Logged in state */
            <div className={`flex items-center gap-2.5 ${!isOpen && !isMobile ? 'justify-center' : ''}`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              {(isOpen || isMobile) && (
                <div className="flex-1 truncate">
                  <div className="text-xs font-medium text-slate-200 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">{user.email}</div>
                </div>
              )}
              {(isOpen || isMobile) && (
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-white/[0.06] taste-btn cursor-pointer"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : (
            /* Guest state */
            <div className={`flex items-center gap-2.5 ${!isOpen && !isMobile ? 'justify-center' : ''}`}>
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] text-slate-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                G
              </div>
              {(isOpen || isMobile) && (
                <div className="flex-1 truncate">
                  <div className="text-xs font-medium text-slate-300 truncate">Guest Mode</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span>{isBackendOnline ? 'API Connected' : 'Mock Mode'}</span>
                  </div>
                </div>
              )}
              {(isOpen || isMobile) && (
                <button
                  onClick={onOpenAuth}
                  title="Sign In"
                  className="px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-blue-400 hover:text-blue-300 text-[11px] font-medium taste-btn cursor-pointer border border-white/[0.08]"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
