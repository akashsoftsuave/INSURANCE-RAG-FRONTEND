# Insurance RAG Frontend — Design

Date: 2026-08-07

## Purpose

Provide a React frontend for the existing "Akash AI" Insurance RAG backend
(`D:\Akash_AI\insurance-rag-backend`, FastAPI). The product: upload a single
insurance policy PDF, then chat with it and get answers with page citations.

## Backend API (existing, read-only reference)

Base URL (dev): `http://localhost:8000`

- `POST /api/v1/ingest/pdf`
  - Request: `multipart/form-data`, field `file` (must be `.pdf`)
  - Response `200`:
    ```json
    {
      "message": "Document processed successfully.",
      "filename": "insurance.pdf",
      "total_pages": 12,
      "total_chunks": 84,
      "embedding_dimension": 384
    }
    ```
  - Response `400`: `{ "detail": "Only PDF files are allowed." }`
  - Note: single-document project — a new upload replaces the previous document server-side.

- `POST /api/v1/chat/`
  - Request: `{ "question": "string" }`
  - Response `200`:
    ```json
    {
      "answer": "string",
      "sources": [{ "page": 3 }, { "page": 7 }]
    }
    ```

- `GET /health` → `{ "status": "healthy" }`

No auth. No CORS middleware configured yet (see Backend Change below).

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS for styling
- No routing library (single page)
- No state management library — local React state is sufficient at this scope

## Architecture

Single page, two-panel layout:

```
┌─────────────────────────────────────────────┐
│  Header ("Akash AI — Insurance Assistant")   │
├───────────────┬───────────────────────────────┤
│ Document Panel │            Chat Panel         │
│ (upload/status)│  (transcript + question box)  │
└───────────────┴───────────────────────────────┘
```

### Components

- `App.tsx` — layout shell; owns `documentStatus` state and `messages`
  (chat transcript) state; passes state + handlers down as props.
- `DocumentPanel.tsx` — file picker + upload button; shows current document
  status (filename, total_pages, total_chunks) once ingested; shows
  upload-in-progress and upload-error states.
- `ChatPanel.tsx` — scrollable message list + question input; input/send
  disabled until a document has been successfully ingested; shows a
  send-in-progress state.
- `MessageBubble.tsx` — renders one transcript entry (user question or
  assistant answer); assistant bubbles show a "Sources: p.3, p.7" line built
  from `sources[].page` (dedup, sorted ascending) when present.
- `api/client.ts` — thin `fetch` wrapper exposing `uploadPdf(file)` and
  `askQuestion(question)`, typed against the response shapes above. Reads
  the API base URL from `VITE_API_BASE_URL`.
- `api/types.ts` — TypeScript types mirroring the Pydantic schemas
  (`IngestResponse`, `ChatResponse`, `Source`).

### Data Flow

1. User selects a PDF in `DocumentPanel` → `uploadPdf()` → on success,
   `App` stores `{filename, total_pages, total_chunks}` and the chat input
   becomes enabled. On failure, an inline error is shown in `DocumentPanel`.
2. User types a question in `ChatPanel` → a "user" message is appended to
   the transcript immediately → `askQuestion()` is called → on success an
   "assistant" message (answer + sources) is appended; on failure an
   inline error message is appended to the transcript instead (transcript
   is never cleared/discarded on error).
3. Chat input is disabled whenever `documentStatus` is empty (no document
   ingested yet) or a request is in flight.

### Error Handling

- Network/backend-down errors and non-2xx responses are caught in
  `api/client.ts` and surfaced as thrown `Error`s with a readable message.
- `DocumentPanel` and `ChatPanel` catch these and render inline error UI
  (not a crash, not a silent failure).

## Backend Change (small, in existing backend repo)

Add `CORSMiddleware` to `app/main.py` in `insurance-rag-backend`, allowing
origin `http://localhost:5173` (Vite's default dev port), so the browser
does not block requests from the React dev server.

## Configuration

- `VITE_API_BASE_URL` env var, defaulting to `http://localhost:8000`, via
  a `.env` file (git-ignored) with `.env.example` committed for reference.

## Out of Scope (YAGNI)

The backend does not support these today, so the frontend will not
pretend to:

- Auth / multi-user
- Multi-document support (backend is single-document, replace-on-upload)
- Persisting chat history across page reloads
- Streaming responses (backend returns a full answer, not a stream)

## Testing

- Component-level: basic render/interaction tests are optional given the
  small surface area; not required for initial delivery.
- Manual verification: run backend + frontend dev servers, upload a real
  PDF, ask a question, confirm answer + sources render, confirm error
  states (e.g. non-PDF file, backend stopped) render sensibly.
