# PromtLap Backend: Current Status and Roadmap

**Updated:** November 19, 2026  
**Scope:** Backend in `server/`; frontend status below is summarized from `../docs/collaboration.md`.

## Product

PromtLap turns a user's rough request into a clear, structured prompt for another AI model. It can ask clarification questions, but it does not execute the generated prompt or build the application described by it.

## Current implementation

Backend phases 1–3 are implemented:

### Foundation

- Node.js with JavaScript ES Modules and Express 5.
- MongoDB connection through Mongoose.
- Environment configuration through dotenv.
- Helmet security headers, restricted CORS, JSON body size limit, and centralized API errors.
- Health endpoint: `GET /api/v1/health`.
- Global API rate limit.

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- Passwords are hashed with bcrypt; password hashes are excluded from user responses.
- JWTs are set in HTTP-only cookies. Cookie security and SameSite behavior are configurable for deployment.
- Zod request validation and authentication rate limiting are enabled.

### Prompt optimization and Requesty

- `POST /api/v1/prompts/optimize` sends the request to Requesty's OpenAI-compatible chat-completions API.
- The default Requesty model is `nvidia/nemotron-3.5-lightning-30b-a3b`; override it with `REQUESTY_MODEL`.
- The request asks Requesty for strict JSON-schema output. The backend validates the result with Zod and retries once if the output is malformed or invalid.
- The result contains an optimized prompt, a `ready` or `needs_clarification` status, up to three clarification questions, assumptions, and improvements.
- A successful initial optimization is persisted as prompt version 1.
- Authenticated users' prompts are associated with their account. Guest ownership is represented by a random HTTP-only cookie; only a hash of the guest identifier is stored. Guests may create one initial prompt.
- Optimization inputs accept `originalInput`, optional `category`, `targetModel`, `outputStyle`, and `context`.

The `targetModel` request field describes the model family the prompt should address. The actual Requesty route is controlled by the server's `REQUESTY_MODEL` setting.

### Data models

- `User`: name, normalized unique email, password hash, plan, timestamps.
- `Prompt`: owner, title, original input, context, category, target model, output style, current version, tags, timestamps.
- `PromptVersion`: version number, optimized prompt, questions, assumptions, improvements, action, creator, provider/model, timestamps.

Usage logs and usage reporting are not implemented yet.

## API contracts

### Initial optimization

Request:

```json
{
  "originalInput": "Build a MERN expense tracker",
  "category": "development",
  "targetModel": "nvidia/nemotron-3.5-lightning-30b-a3b",
  "outputStyle": "structured",
  "context": "Optional additional requirements"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "promptId": "...",
    "version": {
      "id": "...",
      "versionNumber": 1,
      "status": "needs_clarification",
      "optimizedPrompt": "...",
      "clarificationQuestions": [
        {
          "id": "q1",
          "question": "...",
          "reason": "..."
        }
      ],
      "assumptions": [],
      "improvements": [],
      "action": "initial",
      "createdAt": "..."
    },
    "title": "...",
    "owner": "guest"
  }
}
```

All API errors use the `{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }` envelope; `details` is included when applicable. Relevant codes include `VALIDATION_ERROR`, `UNAUTHORIZED`, `GUEST_LIMIT_REACHED`, `DATABASE_UNAVAILABLE`, `AI_PROVIDER_UNAVAILABLE`, `AI_PROVIDER_TIMEOUT`, `RATE_LIMITED`, and `AI_PROVIDER_ERROR`.

### Browser integration

- Local API base URL: `http://localhost:5000/api/v1`.
- The frontend origin is configured with `CLIENT_URL` (currently `http://localhost:5173`).
- Browser requests must send credentials (`fetch` `credentials: "include"` or Axios `withCredentials: true`) so the HTTP-only auth and guest cookies work.
- The collaboration log reports that the frontend has auth and initial optimization wired. No client files were inspected for this status document.

## Configuration and local development

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|---|---|
| `PORT` | API port; defaults to `5000`. |
| `NODE_ENV` | Environment mode. |
| `CLIENT_URL` | Exact allowed browser origin. |
| `MONGODB_URI` | MongoDB connection string. |
| `REQUESTY_API_KEY` | Server-side Requesty credential. Never expose it to the browser. |
| `REQUESTY_BASE_URL` | Requesty API base URL. |
| `REQUESTY_MODEL` | Model or Requesty routing policy used by the backend. |
| `REQUESTY_TIMEOUT_MS` | Request timeout. |
| `REQUESTY_MAX_OUTPUT_TOKENS` | Maximum generated output tokens. |
| `JWT_SECRET` | Random secret of at least 32 characters. |
| `COOKIE_SAME_SITE` | Cookie SameSite policy; use `none` only with HTTPS. |

Commands from `server/`:

```bash
npm install
npm run dev
npm test
```

`npm start` starts the API without file watching.

## Verification completed

- Source syntax checks pass.
- The backend test suite passed **9 tests** at the last run.
- A direct Requesty call returned valid structured output using the configured model.
- The full optimize HTTP flow returned `201`, persisted version 1, and its temporary smoke-test prompt/version were removed afterward.
- Health, auth error behavior, and CORS credentials were smoke-tested with MongoDB connected.

These are development checks, not a production-readiness or load-test certification.

## Current limitations

- Only initial optimization is implemented. Refinement after clarification answers or manual editing is not available yet.
- Prompt list/search, detail, version history, metadata update, deletion, and usage endpoints are not implemented.
- Guest prompt transfer to a newly registered/logged-in account is not implemented.
- Usage/token/cost records are not persisted.
- Provider selection is server-configured; the client cannot choose an arbitrary upstream model.
- Production deployment, monitoring, and security configuration still need review.

## Roadmap

### Phase 4 — Prompt refinement and management

- Implement `POST /api/v1/prompts/:id/refine` for `answer_questions` and `recreate`.
- Load authoritative prompt/version history from MongoDB; reject unknown question IDs and enforce ownership.
- Preserve prompt versions and make the current version update reliable.
- Implement prompt list/search/pagination, detail/version retrieval, metadata update, and deletion.
- Decide and implement guest-prompt claiming during registration/login.
- Add focused tests for refinement, version history, ownership, and guest behavior.

### Phase 5 — Usage and production readiness

- Persist provider, model, token usage, latency, cost where available, and request status.
- Add `GET /api/v1/usage`.
- Review rate limits, database indexes, cookie/CORS deployment settings, request logging, and health/readiness behavior.
- Validate deployment configuration and failure handling against production-like services.

### Later product work

- Model-aware optimization and evaluation against the original prompt.
- Prompt templates, personal/team libraries, and developer API integrations.
