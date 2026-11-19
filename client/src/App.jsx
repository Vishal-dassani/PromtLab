import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainWorkspace from './components/MainWorkspace';
import ClarificationDeck from './components/ClarificationDeck';
import AuthModal from './components/AuthModal';
import { promptService } from './services/promptService';
import { authService } from './services/authService';
import { INITIAL_MOCK_PROMPT } from './services/mockData';

export default function App() {
  const [history, setHistory] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Responsive breakpoint states
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isClarificationOpen, setIsClarificationOpen] = useState(true);

  // Check backend health & active session on mount
  useEffect(() => {
    async function initConnection() {
      const health = await authService.checkHealth();
      setIsBackendOnline(health.online);

      if (health.online) {
        const currentUser = await authService.getMe();
        if (currentUser) setUser(currentUser);
      }
    }
    initConnection();
  }, []);

  // Auto-detect window size and adjust panels
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1200;

      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
        setIsClarificationOpen(false);
      } else if (tablet) {
        setIsSidebarOpen(false);
        setIsClarificationOpen(false);
      } else {
        setIsSidebarOpen(true);
        setIsClarificationOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load history on mount
  useEffect(() => {
    async function fetchHistory() {
      const items = await promptService.getHistory();
      setHistory(items);
    }
    fetchHistory();
  }, []);

  // Handle new prompt reset
  const handleNewPrompt = () => {
    setActivePrompt(null);
  };

  // Handle selecting an item from the sidebar
  const handleSelectPrompt = (id) => {
    if (activePrompt?.promptId === id) return;

    const item = history.find(h => h.id === id);
    if (item) {
      setActivePrompt({
        promptId: item.id,
        title: item.title,
        owner: user ? "user" : "guest",
        version: {
          ...INITIAL_MOCK_PROMPT.version,
          versionNumber: item.currentVersion,
          createdAt: item.updatedAt
        }
      });
      if (!isMobile && window.innerWidth >= 1200) {
        setIsClarificationOpen(true);
      }
    }
  };

  // Initial optimization
  const handleOptimize = async ({ originalInput, category, targetModel }) => {
    setIsLoading(true);
    try {
      const result = await promptService.optimize({ originalInput, category, targetModel });
      setActivePrompt(result);

      // Prepend to history
      const newHistoryItem = {
        id: result.promptId,
        title: result.title,
        preview: result.version.optimizedPrompt.slice(0, 60) + '...',
        currentVersion: result.version.versionNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      setIsClarificationOpen(true);
    } catch (err) {
      console.error("Optimization failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refine via answering questions
  const handleApplyAnswers = async (answers) => {
    if (!activePrompt) return;
    setIsLoading(true);
    try {
      const result = await promptService.refine(activePrompt.promptId, {
        action: "answer_questions",
        answers
      });
      setActivePrompt(result);
    } catch (err) {
      console.error("Refining with answers failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refine via manual re-create
  const handleRefineRecreate = async (editedPrompt) => {
    if (!activePrompt) return;
    setIsLoading(true);
    try {
      const result = await promptService.refine(activePrompt.promptId, {
        action: "recreate",
        editedPrompt
      });
      setActivePrompt(result);
    } catch (err) {
      console.error("Manual re-create failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090d] text-slate-100 font-sans relative">
      {/* 1. Left Section: Sidebar */}
      <Sidebar
        history={history}
        activePromptId={activePrompt?.promptId}
        onSelectPrompt={handleSelectPrompt}
        onNewPrompt={handleNewPrompt}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        isMobile={isMobile}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isBackendOnline={isBackendOnline}
      />

      {/* 2. Middle Section: Main Studio & Editor Workspace */}
      <MainWorkspace
        activePrompt={activePrompt}
        isLoading={isLoading}
        onOptimize={handleOptimize}
        onRefineRecreate={handleRefineRecreate}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onToggleClarification={() => setIsClarificationOpen(prev => !prev)}
        isClarificationOpen={isClarificationOpen}
        isMobile={isMobile}
      />

      {/* 3. Right Section: Clarification Window */}
      <ClarificationDeck
        activePrompt={activePrompt}
        isLoading={isLoading}
        onApplyAnswers={handleApplyAnswers}
        isOpen={isClarificationOpen}
        onToggle={() => setIsClarificationOpen(prev => !prev)}
        isMobile={isMobile}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}
