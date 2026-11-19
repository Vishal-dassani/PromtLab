// Mock data matching the agreed PromtLap API contract
export const INITIAL_MOCK_PROMPT = {
  promptId: "prompt-101",
  title: "MERN Personal Expense Tracker",
  owner: "guest",
  version: {
    id: "ver-1",
    versionNumber: 1,
    optimizedPrompt: `### Role & Objective
You are an expert full-stack engineer building a production-ready Personal Expense Tracker application using the MERN stack (MongoDB, Express.js, React, Node.js).

### Architectural Requirements
1. **Frontend (React + Vite)**:
   - Modern, responsive dashboard built with Tailwind CSS.
   - Clean state management for expense records, filters, and analytics.
   - Client-side validation using standard schema validation.

2. **Backend (Node.js + Express)**:
   - Modular RESTful API architecture (Routes -> Controllers -> Services -> Models).
   - Robust error handling middleware with standardized JSON responses.
   - Secure CORS configuration and rate limiting on sensitive endpoints.

3. **Data Layer (MongoDB + Mongoose)**:
   - Strict schema definitions with indexed query fields (\`userId\`, \`category\`, \`date\`).
   - Aggregation pipelines for monthly summary calculations.`,
    clarificationQuestions: [
      {
        id: "q1",
        question: "Should users have individual accounts and authentication?",
        reason: "Determines authentication strategy (JWT/cookies) and multi-tenant data isolation."
      },
      {
        id: "q2",
        question: "Should the application categorize expenses automatically or manually?",
        reason: "Determines whether to implement rule-based classification logic."
      },
      {
        id: "q3",
        question: "Do you require interactive charts (e.g., Recharts) and CSV data export?",
        reason: "Impacts frontend dependencies and reporting export utilities."
      }
    ],
    assumptions: [
      "MongoDB will be used as the primary database.",
      "Authentication will default to JWT with HTTP-only cookies if accounts are enabled.",
      "Modern React (v19) functional components with hooks."
    ],
    improvements: [
      "Added multi-layer error handling and rate-limiting specifications.",
      "Structured into clear Frontend, Backend, and Data Layer separation.",
      "Pre-configured aggregation pipelines for analytics."
    ],
    action: "initial",
    createdAt: new Date().toISOString()
  }
};

export const MOCK_HISTORY = [
  {
    id: "prompt-101",
    title: "MERN Personal Expense Tracker",
    preview: "Build a production-grade MERN personal expense tracker with...",
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prompt-102",
    title: "Secure JWT Authentication Flow",
    preview: "Implement HTTP-only cookie authentication with Express and React...",
    currentVersion: 2,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "prompt-103",
    title: "PostgreSQL Database Schema & Migrations",
    preview: "Design normalized schema for e-commerce with order items...",
    currentVersion: 3,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];
