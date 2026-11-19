import { INITIAL_MOCK_PROMPT, MOCK_HISTORY } from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const promptService = {
  // Fetch sidebar history
  async getHistory() {
    try {
      const res = await fetch(`${API_BASE}/prompts`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.data.items;
    } catch {
      return MOCK_HISTORY;
    }
  },

  // Initial optimization (Calls backend Requesty endpoint or fallback mock)
  async optimize(payload) {
    try {
      const res = await fetch(`${API_BASE}/prompts/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          originalInput: payload.originalInput,
          category: payload.category || 'development',
          targetModel: payload.targetModel || 'nvidia/nemotron-3.5-lightning-30b-a3b',
          outputStyle: payload.outputStyle || 'structured'
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        console.warn('Backend optimize error:', json.error?.message);
        throw new Error(json.error?.message || 'API optimization failed');
      }
      return json.data;
    } catch (err) {
      console.info('Backend unavailable or errored, using local simulation. Reason:', err.message);
      await new Promise(r => setTimeout(r, 700));
      return {
        ...INITIAL_MOCK_PROMPT,
        title: payload.originalInput.slice(0, 30) + '...',
        version: {
          ...INITIAL_MOCK_PROMPT.version,
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  // Refine prompt (answer questions or recreate)
  async refine(promptId, payload) {
    try {
      const res = await fetch(`${API_BASE}/prompts/${promptId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Refine failed');
      const json = await res.json();
      return json.data;
    } catch {
      await new Promise(r => setTimeout(r, 800));
      
      let updatedPrompt = INITIAL_MOCK_PROMPT.version.optimizedPrompt;
      let improvements = ["Integrated user decisions into architectural specification."];

      if (payload.action === 'answer_questions') {
        const answers = payload.answers || {};
        const additions = Object.entries(answers)
          .map(([qId, ans]) => `- **${qId.toUpperCase()} Decision**: ${ans}`)
          .join('\n');
        
        updatedPrompt += `\n\n### Clarified Constraints & Decisions\n${additions}`;
      } else if (payload.action === 'recreate') {
        updatedPrompt = payload.editedPrompt;
        improvements = ["Applied manual adjustments and refined clarity."];
      }

      return {
        promptId: promptId || "prompt-101",
        title: "Refined Specification",
        owner: "guest",
        version: {
          id: `ver-${Date.now()}`,
          versionNumber: 2,
          optimizedPrompt: updatedPrompt,
          clarificationQuestions: [],
          assumptions: ["All user decisions have been codified into constraints."],
          improvements,
          action: payload.action,
          createdAt: new Date().toISOString()
        }
      };
    }
  }
};
