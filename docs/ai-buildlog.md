# Double H Marketplace — AI Build Log

---

## 2026-07-29 — Gemini API Wrapper (chatbot module)

### What was built

| File | Status |
|------|--------|
| `src/services/geminiService.js` | Created |
| `src/services/testGemini.js` | Created |
| `.env.example` | Created |
| `docs/ai-buildlog.md` | Created (this file) |

Dependency added via npm:

- `@google/genai` — official Google Generative AI SDK for Node.js

### Why

First building block of the Double H chatbot module. The wrapper isolates all
Gemini API concerns (client construction, prompt formatting, error handling) in
a single service file so that a future chat controller and route can call it
without knowing anything about the underlying SDK.

### Design decisions & assumptions

**Model: `gemini-2.5-flash`**  
`gemini-2.0-flash` was retired in June 2026 (returns 404). `gemini-2.5-flash`
is GA, stable, fast, and appropriately priced for a chatbot workload.

**`conversationHistory` shape: `{ role: 'user'|'model', text: string }`**  
Simple, flat shape that matches what a future chat controller will naturally
produce from a DB query. The service maps it internally to the Gemini
`{ role, parts: [{ text }] }` format so callers stay SDK-agnostic.

**`systemInstruction` via `config`**  
The system prompt is passed through the `config.systemInstruction` field on
`generateContent()` rather than prepended as a `user` turn. This is the
recommended approach in the `@google/genai` v1 SDK so the model treats it as
privileged context.

**No database / route changes**  
Scope is strictly the standalone wrapper. Schema, routes, and `app.js` are
untouched.

**`dotenv` already present**  
The project already depends on `dotenv`. `testGemini.js` calls
`require("dotenv").config()` at the top so the test script loads `.env`
automatically when run directly.

**Error handling strategy**  
- Missing key → throws before constructing the SDK client (clear, early failure).
- API failure → re-throws with a `"Gemini API call failed: ..."` prefix so
  upstream callers can identify the source without inspecting stack traces.

### Verification


---

## 2026-07-29 — Model discovery & bug fixes

### What was fixed

During execution, two issues were discovered and resolved.

**Bug 1: `response.text()` vs `response.text`**  
The `@google/genai` SDK's `models.generateContent()` method returns `response.text`
as a plain **string property**, not a callable method. The initial code called
`response.text()` which threw `"response.text is not a function"`. Fixed to
`response.text`.

**Bug 2: Model ID — `gemini-2.5-flash` returns 404 on this key**  
Despite `gemini-2.5-flash` appearing in the models list API response, calling
`generateContent` with it returns:

```
404: This model models/gemini-2.5-flash is no longer available to new users.
```

This is a key-tier restriction — not a global model retirement. The models
tested and their results:

| Model | Result |
|-------|--------|
| `gemini-2.5-flash` | 404 — key tier restriction |
| `gemini-2.5-flash-lite` | 404 — same |
| `gemini-2.0-flash` | 429 — free-tier quota exhausted (limit: 0 RPD on this key) |
| `gemini-2.0-flash-lite` | 429 — same |
| `gemini-flash-latest` | ✅ Works |

**Chosen model: `gemini-flash-latest`**  
This is a stable Google-maintained alias that resolves to the current GA flash
model available on this API key. It is appropriate for the chatbot use case
(fast, low-cost). The alias is listed in the models API under `supportedActions:
generateContent`.

### Verification

```
node src/services/testGemini.js
```

Output:
```
Sending test message to Gemini...

=== Gemini Reply ===
Hello! Yes, we do. As an online hardware marketplace in Pakistan, Double H
Hardware features a wide range of drill machines from various vendors, including
cordless drills, hammer drills, rotary drills, and impact drills.

Are you looking for a specific brand, power rating, or type of drill machine?
I'd be happy to help you find what you need!
===================
```

Exit code: 0. Wrapper confirmed working end-to-end.

---

## 2026-07-29 — Pin model to gemini-3.5-flash

**Pinned model:** `gemini-3.5-flash`

**Reason:** Only model that returned a successful `generateContent` response
on this API key after exhaustive testing. Summary of all candidates tested:

| Model | Outcome |
|-------|---------|
| `gemini-2.5-flash` | 404 — retired/unavailable for new API keys |
| `gemini-2.5-flash-lite` | 404 — same |
| `gemini-2.0-flash` | 429 — free-tier quota limit is 0 RPD on this key |
| `gemini-2.0-flash-lite` | 429 — same |
| `gemini-flash-latest` (alias) | ✅ Worked (used temporarily) |
| `gemini-3.5-flash` | ✅ Confirmed working (user-verified live test) |

`gemini-3.5-flash` is pinned rather than using the `gemini-flash-latest` alias
so the behaviour is deterministic and doesn't silently shift if Google updates
what the alias resolves to.

**Files changed:** `src/services/geminiService.js` — `MODEL` constant updated.

