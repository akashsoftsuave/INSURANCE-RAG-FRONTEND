# Insurance RAG — Frontend

React 19 + Vite + Tailwind v4 UI for the insurance RAG backend: upload a
policy PDF, ask questions about it, and see how the answer was produced.

## Running

```bash
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

The backend must be running separately (`uvicorn app.main:app --reload` in
INSURANCE-RAG-BACKEND).

```bash
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

## Retrieval modes

The chat panel has a mode selector with three options:

| Mode | What the backend does |
|---|---|
| **Fixed** | One retrieval round on the question as written, then answer. |
| **Agentic** | Plans queries, retrieves over multiple rounds, checks whether the evidence is sufficient, reformulates if not, then answers. |
| **Auto** | The backend classifies the question and picks fixed or agentic itself. |

Two things about this are deliberate:

**The options come from the backend.** `ModeSelector` fetches
`GET /api/v1/chat/modes` on mount and renders whatever that returns, with
its descriptions as tooltips. Adding a mode server-side needs no frontend
change. The hard-coded list in `ModeSelector.tsx` is only a fallback for when
the backend is unreachable, and the UI says so when it is used.

**The client never routes.** Picking `auto` does not mean the frontend
decides — it asks the backend to decide. The routing logic lives in
`app/services/rag_router.py` and nowhere else. The frontend only *reports*
the outcome: the response carries `mode` (the flow that actually ran) and
`routing.explanation` (why), which is what the `auto → agentic` badge and the
line under it show.

## What each answer reports

`RunMetadata.tsx` renders, under every answer:

- which flow ran, and for `auto`, why it was routed there
- retrieval rounds
- the queries actually issued — expandable, so you can see what agentic mode
  reformulated the question into
- latency, total tokens, cost
- the trace id, to look the run up in the backend's JSONL trace log

This is what makes the two flows comparable by eye: ask the same question in
each mode and the cost of the extra rounds is visible next to whether they
bought a better answer.

**Compare both flows** (checkbox) sends the same question twice, once per
flow, and appends both answers. It is purely a client convenience — two
ordinary requests, each of which the backend routes normally.

## Layout

```
src/
  api/
    client.ts       askQuestion(question, mode), fetchModes(), uploadPdf()
    types.ts        wire types, mirroring the backend's ChatResponse
  components/
    DocumentPanel   PDF upload + ingest status
    ChatPanel       message list, mode selector, compare toggle, composer
    MessageBubble   one message
    ModeSelector    backend-driven mode radio group
    RunMetadata     per-answer mode/rounds/queries/latency/tokens/cost
  types.ts          app-level message + RunMetadata shapes
  App.tsx           mode state, send handling
```

## Notes

- Every field the backend added is optional in `ChatResponse`. The route uses
  `response_model_exclude_none`, and an older backend omits them entirely —
  in both cases the metadata panel simply does not render.
- A 429 from the model provider is surfaced as its `detail` message. Agentic
  mode spends several model calls per question, so it reaches the provider's
  per-minute cap sooner than fixed mode does.
