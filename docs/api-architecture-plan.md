# API Layer Architecture & Scalability Plan

**Scope:** `src/api/` — the client-side API layer (transport, cache, and data-access hooks) for the agent1o1 React SPA against the Laravel `/api/v1` backend.

**Status of the current layer:** 38 modules, ~200 files, 305 exported hooks, ~4,900 LOC.

---

## 0. Verdict

**This does not need a rewrite.** The bones are better than most codebases this size:

- Module-per-resource with a consistent 4-file contract (`endpoints` / `keys` / `service` / `hooks`).
- A typed error class (`ApiError`) produced by a single normalizing interceptor.
- Envelope unwrapping (`unwrap`) isolated in one place.
- **Zero transport leakage** — no file outside `src/api/` imports `axios` or `axiosClient`. That single property is what makes everything below cheap to do.

What it has is the failure mode of a layer that grew fast and correctly: **the conventions were written down but never mechanised.** Every module re-types the same 80 lines by hand, so drift is inevitable and already measurable. The work is to convert conventions into code that cannot be broken, and to fix five defects that are shipping today.

The plan below is ordered by *risk retired per hour spent*, not by architectural elegance.

---

## 1. What is actually wrong

### 1.1 Defects shipping today (P0)

#### D1 — Every failed mutation shows two toasts

`client/interceptors/normalize-error.ts` toasts globally on 403 / 404 / 422 / 429 / 5xx. Independently, **188 hook call-sites** pass `onError: notify.fromError(...)`. Both fire. A 422 on a create form shows the validation toast twice.

This is not a cosmetic bug — it is a symptom of **two owners for error presentation**. Neither layer can be changed safely because neither knows what the other will do.

#### D2 — Token refresh can loop

`client/interceptors/refresh-token.ts` sets `originalRequest._retry = true` only on the request that *wins* the race. Requests parked in `failedQueue` are replayed via `client(originalRequest)` **without `_retry` set**. If the refreshed token is still rejected (revoked session, clock skew, backend rotation), each queued request re-enters the refresh path and re-queues. Under a burst — the dashboard fires 6+ parallel queries — this is an amplifying loop against `/auth/refresh`.

#### D3 — Full request and response bodies are logged in production

`client/axios.ts` registers unconditional `console.info` interceptors that log every request payload and **every response body**. `maskSensitivePayload` redacts key names matching a regex, which does not cover workflow node parameters, credential payload bodies, or agent conversation content. In production this is a measurable main-thread cost on large execution payloads and it puts customer data in the browser console.

#### D4 — `.env` is committed to the repository

`.env` is tracked (`git ls-files .env` returns it) and carries `VITE_REVERB_APP_KEY`, the API URL, and the WS host. `.gitignore` only excludes `.env.local` and friends. Anything `VITE_`-prefixed is public by construction once built, but committing the file means every environment change is a code change and rotation requires a commit.

#### D5 — `retry: 1` retries 4xx

`core/query-client.ts` sets a blanket `retry: 1`. A 403 or a 422 is retried once, doubling latency on the exact failures the user is waiting on, and doubling load on an already-refusing endpoint.

### 1.2 Layering violations (P1)

| Where | What | Why it matters |
|---|---|---|
| `core/notify.ts` | `isEditorRoute()` reads `window.location.pathname.startsWith('/app/editor')` to suppress toasts | The API core knows the app's route table. Rename the route and toasts silently return. |
| `client/interceptors/refresh-token.ts` | `window.location.href = '/login'` | Hard navigation: full page reload, React Router state destroyed, in-flight work lost, unsaved editor state gone. |
| `core/types.ts` | Re-exports domain types from `@/types/api.type` | The layer's own contract lives outside the layer. |

The API layer should emit **events and errors**. Deciding what a 401 means for navigation is the app shell's job.

### 1.3 Structural drift (P1)

- **`createResource` is dead code.** `core/create-resource.ts` implements exactly the CRUD factory this layer needs. It has **zero call sites.** Meanwhile ~60% of the 305 hooks are mechanical restatements of what it already does.
- **Barrel drift.** `modules/index.ts` omits `artifacts`, `dashboard`, and `plans` entirely — those modules are unreachable from `@/api`. `workspace-members` is hand-enumerated with a rename (`useLeaveWorkspace as useLeaveWorkspaceMember`) to dodge a name collision. That workaround is the flat barrel telling you it does not scale.
- **Query-key inconsistency** makes generic cache tooling impossible:
  - `nodeTypes` is camelCase; every other root is kebab-case.
  - The `invitations` module keys under `'user-invitations'`.
  - `onboardingKeys.all` is an array *value*; everywhere else `all` is a *function*.
  - `all: (ws?: string)` is optional in 5 modules, required in the rest.
  - `list` takes `params` in some modules, ignores it in others — those modules cannot cache two filter sets at once.
- **Missing files:** `node-sandbox` and `vector-store` have no `.keys.ts`.
- **Oversized modules:** `agents.hooks.ts` is 549 lines covering agents, skills, knowledge, memory, runs, and analytics. `workflows/` holds four distinct sub-domains (`editor`, `shares`, `trigger-events`, `governance`) flattened into one barrel.

### 1.4 Cache behaviour (P2)

- **102 of 171 invalidations use `keys.all(ws)`** — renaming one tag invalidates every tag list, every tag detail, and every filtered variant in the workspace. On a busy screen that is a refetch storm.
- **Zero optimistic updates** (`onMutate` count: 0). Every mutation is a full round-trip before the UI moves.
- **Zero `useInfiniteQuery`.** All pagination is offset page-swap, which flashes empty state on every page change.

### 1.5 Safety net (P2)

- **No tests.** `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, and `@types/jest` are installed. There is no runner, no `test` script, and no test file in the repo.
- **No runtime contract validation.** Types are hand-written TS mirroring Laravel resources. When the backend renames a field, TypeScript stays green and the UI renders `undefined`.

---

## 2. Target architecture

```
src/api/
├── client/                        # transport — knows HTTP, knows nothing about React
│   ├── axios.ts                   # instance + interceptor wiring only
│   ├── logger.ts                  # NEW  env-gated, sampled, redacting
│   └── interceptors/
│       ├── attach-auth.ts
│       ├── refresh-token.ts       # FIX  _retry on replays; emits events, never navigates
│       └── normalize-error.ts     # FIX  pure normalisation — no toasts
│
├── core/                          # primitives — the only place conventions are defined
│   ├── config.ts                  # NEW  validated env, single source of VITE_* truth
│   ├── errors.ts                  # ApiError + predicates (isValidation/isAuth/isServer)
│   ├── envelope.ts
│   ├── notify.ts                  # FIX  injectable adapter, no route knowledge
│   ├── auth-events.ts             # NEW  typed emitter; replaces window.location
│   ├── query-client.ts            # FIX  QueryCache/MutationCache own error display
│   ├── keys.ts                    # NEW  createKeys() — one key shape, everywhere
│   ├── resource.ts                # createResource, extended and actually used
│   └── types.ts
│
├── modules/<resource>/
│   ├── <r>.endpoints.ts
│   ├── <r>.keys.ts                # = createKeys('<r>')
│   ├── <r>.contract.ts            # NEW  optional zod schema, dev-parsed
│   ├── <r>.service.ts
│   ├── <r>.hooks.ts               # thin: factory + genuinely custom hooks only
│   ├── <r>.realtime.ts            # only where the resource streams
│   └── index.ts
│
└── index.ts                       # namespaced — no flat `export *`
```

**The one rule that holds it together:** *conventions live in `core/` as executable code, not in `README.md` as prose.* A module that cannot be expressed through the primitives is a module whose shape you should question.

---

## 3. The work, in dependency order

### Phase 0 — Stop the bleeding (≈1 day, no API surface change)

Independent, individually revertable, ship same-day.

**0.1 One owner for error display.** Strip every `notify.*` call from `normalize-error.ts`. It becomes a pure `AxiosError → ApiError` mapper. Display moves to the query client:

```ts
// core/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from './errors';
import { notify } from './notify';

const shouldRetry = (count: number, error: unknown) => {
  if (ApiError.is(error) && error.status && error.status < 500 && error.status !== 429) {
    return false;              // never retry a refusal
  }
  return count < 2;
};

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.silent) return;
        notify.error(ApiError.is(error) ? error.message : 'Could not load data');
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.silent) return;
        const fallback = (mutation.meta?.errorMessage as string) ?? 'Something went wrong';
        notify.error(ApiError.is(error) ? error.message : fallback);
      },
    }),
    defaultOptions: {
      queries: { staleTime: 5 * 60_000, gcTime: 10 * 60_000, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  });
```

Then all 188 `onError: notify.fromError('Failed to create tag')` sites become `meta: { errorMessage: 'Failed to create tag' }` — mechanical, and it deletes a closure per hook.

**0.2 Fix the refresh loop.** Mark replayed requests before re-issuing them:

```ts
.then((token) => {
  originalRequest._retry = true;               // ← the missing line
  if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
  return client(originalRequest);
})
```

Also cap consecutive refresh attempts and drain `failedQueue` in a `finally`, so a rejected refresh cannot leave promises parked forever.

**0.3 Gate the logger.** Move logging out of `axios.ts` into `client/logger.ts`, enabled only when `import.meta.env.DEV || localStorage.getItem('a1o1_debug_api') === '1'`. Log method, URL, status, and duration always; log bodies only under the explicit debug flag. Keeps a production-safe troubleshooting switch without shipping payloads to every user's console.

**0.4 Untrack `.env`.** `git rm --cached .env`, add `.env` to `.gitignore`, commit `.env.example` with the key names and empty values. Rotate `VITE_REVERB_APP_KEY` — it has been in git history. Move real values to the deploy environment (Netlify / Cloudflare, both already configured here).

**0.5 Retry policy.** Shipped as part of 0.1 (`shouldRetry`).

**Exit criteria:** one toast per failure; refresh cannot recurse; production console silent; `.env` untracked; 4xx not retried.

---

### Phase 1 — Primitives (≈3 days)

Additive only. Nothing migrates yet; this builds what Phase 2 migrates *onto*.

**1.1 `core/config.ts`** — read and validate every `VITE_*` once, fail loudly at boot:

```ts
const required = (key: string, value: string | undefined) => {
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const apiConfig = {
  baseUrl: required('VITE_API_URL', import.meta.env.VITE_API_URL),
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 30_000),
  debug: import.meta.env.DEV,
} as const;
```

Removes the `|| 'https://agent1o1.test/api/v1'` fallback in `axios.ts` — a misconfigured production build currently points at a dev host silently.

**1.2 `core/auth-events.ts`** — the API layer announces, the shell decides:

```ts
type AuthEvent = 'session-expired' | 'refreshed' | 'signed-out';
const listeners = new Set<(e: AuthEvent) => void>();
export const authEvents = {
  emit: (e: AuthEvent) => listeners.forEach((l) => l(e)),
  subscribe: (l: (e: AuthEvent) => void) => (listeners.add(l), () => listeners.delete(l)),
};
```

`refresh-token.ts` calls `authEvents.emit('session-expired')` instead of assigning `window.location.href`. A small `<SessionListener>` inside the router calls `navigate('/login', { state: { from: location } })` — soft navigation, preserved state, and the user returns where they were.

**1.3 `core/notify.ts`** — remove `isEditorRoute()`. Suppression becomes a caller decision (`meta: { silent: true }`) or an adapter the shell installs. The editor screen registers its own quiet adapter at mount:

```ts
let adapter: NotifyAdapter = toastAdapter;
export const setNotifyAdapter = (next: NotifyAdapter) => { adapter = next; };
```

This also makes toasts testable — swap in a recording adapter.

**1.4 `core/keys.ts`** — one key shape for every resource:

```ts
export const createKeys = (root: string) => ({
  root:    [root] as const,
  all:     (ws: string) => [root, ws] as const,
  lists:   (ws: string) => [root, ws, 'list'] as const,
  list:    (ws: string, params?: TListParams) => [root, ws, 'list', params ?? {}] as const,
  details: (ws: string) => [root, ws, 'detail'] as const,
  detail:  (ws: string, id: string) => [root, ws, 'detail', id] as const,
});
```

`lists()` and `details()` are the point. `invalidateQueries({ queryKey: keys.lists(ws) })` refreshes list views and **leaves open detail panes untouched** — which is what the 102 blunt `keys.all()` invalidations should have been doing.

**1.5 `core/resource.ts`** — extend the existing factory with what real modules need: granular invalidation via `lists()`, `meta.errorMessage` instead of `onError`, optimistic delete, and an `extra` escape hatch so a module can use the factory *and* add custom hooks.

**Exit criteria:** primitives merged, unit-tested, zero modules migrated, zero behaviour change.

---

### Phase 2 — Migrate modules (≈2 weeks, incremental)

Migrate in ascending order of risk. **One module per PR**, each independently revertable.

| Wave | Modules | Why first |
|---|---|---|
| A | `tags`, `folders`, `variables`, `notes`, `environments` | Textbook CRUD — pure factory, near-total deletion |
| B | `credentials`, `webhooks`, `templates`, `polling-triggers`, `notification-*` | CRUD + a few custom hooks — exercises the `extra` hatch |
| C | `executions`, `workflows`, `agents` | High traffic, realtime, custom cache work — migrate last, with tests |
| D | Read-only: `dashboard`, `plans`, `activity-logs`, `credits`, `connector-metrics` | Trivial; batch them |

Wave A, in full, per module:

```ts
// tags.keys.ts
export const tagKeys = createKeys('tags');

// tags.hooks.ts
const Tags = createResource({
  service: TagService,
  keys: tagKeys,
  label: { singular: 'Tag', plural: 'Tags' },
});

export const useTags       = Tags.useList;
export const useTag        = Tags.useDetail;
export const useCreateTag  = Tags.useCreate;
export const useUpdateTag  = Tags.useUpdate;
export const useDeleteTag  = Tags.useDelete;

// genuinely custom — stays hand-written
export const useAttachTagWorkflows = (ws: string) => { /* ... */ };
```

`tags.hooks.ts` goes from **83 lines to ~25**, and the public hook names are unchanged, so **no consuming component is touched**. That property is what makes this safe to do 38 times.

Alongside each migration:

- Replace `invalidateQueries({ queryKey: keys.all(ws) })` with `keys.lists(ws)` unless the mutation genuinely affects details too.
- Normalise the key root to kebab-case (`nodeTypes` → `node-types`, `user-invitations` → `invitations`).
- Make `onboardingKeys.all` a function.
- Add the missing `node-sandbox` / `vector-store` key files.

**Split the oversized modules** while they are already open:

- `agents/` → `agents.hooks.ts`, `skills.hooks.ts`, `knowledge.hooks.ts`, `memory.hooks.ts`, `runs.hooks.ts` (mirrors the sub-services already in `agents.service.ts`).
- `workflows/` → promote `editor`, `shares`, `trigger-events`, `governance` to sibling modules under `modules/workflows/<sub>/` with their own barrels.

**Exit criteria:** every module uses `createKeys`; ≥70% of CRUD hooks come from the factory; API-layer LOC down ~40%.

---

### Phase 3 — Make drift impossible (≈3 days)

Without this phase, Phase 2 decays within two quarters.

**3.1 Namespaced barrel.** Kill flat `export *` at the root — it is the cause of the `useLeaveWorkspace` collision and it defeats tree-shaking, since `import { useTags } from '@/api'` pulls all 38 modules into the graph.

```ts
// src/api/index.ts
export * from './core';
export { axiosClient } from './client';
export * as tagsApi from './modules/tags';
export * as workflowsApi from './modules/workflows';
// ...
```

Sanctioned import path becomes `@/api/modules/tags`. Enforce it:

```js
// eslint.config.mjs
'no-restricted-imports': ['error', { patterns: [
  { group: ['@/api'], message: 'Import from @/api/modules/<resource> or @/api/core.' },
]}],
```

**3.2 Boundary rules.** Add ESLint constraints that encode the layer contract:

- `react-toastify` importable only from `core/notify.ts`.
- `axios` importable only from `client/`.
- `src/api/**` may not import from `src/pages/**`, `src/components/**`, or `src/context/**`.
- Files matching `*.service.ts` may not import `@tanstack/react-query`.

**3.3 Scaffold generator.** `yarn api:new <resource>` emits the five files pre-wired to the factory. A new resource becomes a 30-second command instead of a copy-paste of the nearest neighbour — which is how the drift in §1.3 happened in the first place.

**3.4 Fold `src/types/*.type.ts` used only by the API layer into their modules** as `<r>.model.ts`, keeping genuinely shared shapes in `@/types`. The layer should own its contract.

**Exit criteria:** collisions structurally impossible; lint fails on a boundary violation; new module in one command.

---

### Phase 4 — Correctness and confidence (≈1.5 weeks)

**4.1 Test infrastructure.** Vitest + MSW. `@testing-library/*` is already installed; add `vitest`, `msw`, `@vitest/coverage-v8`, and a `test` script. Wire `vite.config.mts` for `environment: 'jsdom'` and a setup file importing `@testing-library/jest-dom`.

Test what actually breaks, not everything:

| Target | Test |
|---|---|
| `refresh-token.ts` | Concurrent 401s trigger exactly **one** `/auth/refresh`; failed refresh emits `session-expired` once; no recursion |
| `normalize-error.ts` | 422 → `ApiError` with populated `fields`; network error → `status: undefined` |
| `query-client.ts` | 403 not retried; 500 retried; `meta.silent` suppresses the toast |
| `createResource` | Invalidates `lists` not `all`; optimistic delete rolls back on failure |
| Each service | One MSW round-trip asserting URL, method, and unwrapped shape |

Target: 100% on `core/` and `client/`, one round-trip test per service. This is where the leverage is — a bug in `core/` is a bug in all 38 modules.

**4.2 Contract validation.** Add `zod` schemas for the modules where drift hurts most (`auth`, `workflows`, `executions`, `credentials`, `billing`). Parse in dev, pass through in prod:

```ts
const parse = <T>(schema: ZodType<T>, data: unknown): T =>
  import.meta.env.DEV ? schema.parse(data) : (data as T);
```

A renamed backend field then fails loudly in dev instead of rendering `undefined` in production. If the Laravel side can emit an OpenAPI document, replace the hand-written types with `openapi-typescript` codegen and delete this problem permanently — that is the highest-leverage single change available, but it depends on backend cooperation, so it is sequenced here rather than in Phase 0.

**Exit criteria:** `yarn test` in CI; `core/` and `client/` fully covered; contracts guarded on the five critical modules.

---

### Phase 5 — Performance (≈1 week, ongoing)

Do this **after** Phases 0–3; measuring an unstable layer wastes the measurement.

- **Optimistic updates** via the factory (`onMutate` / `onError` rollback) for the list-heavy screens: tags, folders, variables, notes. Currently zero.
- **`useInfiniteQuery`** for executions, activity logs, and notifications — the three unbounded feeds. Removes the empty-state flash on page change.
- **Prefetch on intent:** `queryClient.prefetchQuery(keys.detail(...))` on row hover in workflow and execution lists.
- **`select` narrowing** so a component subscribing to one field of a large workflow payload does not re-render on unrelated changes.
- **Realtime/cache bridge:** the three `*.realtime.ts` modules currently push into component state. Route Echo events through `queryClient.setQueryData` so realtime and fetched data share one cache and one source of truth.
- **Bundle check:** confirm `@/api` no longer appears whole in the initial chunk after 3.1.

---

## 4. Sequencing

| Phase | Duration | Risk | Blocking |
|---|---|---|---|
| 0 — Defects | 1 day | Very low | Nothing |
| 1 — Primitives | 3 days | Very low (additive) | Phase 0 |
| 2 — Migration | 2 weeks | Low (per-module PRs) | Phase 1 |
| 3 — Guardrails | 3 days | Low | Phase 2 (partial) |
| 4 — Tests + contracts | 1.5 weeks | Low | Phase 1 |
| 5 — Performance | 1 week+ | Medium | Phases 0–3 |

**≈6 weeks for one engineer**, and Phase 4 can run parallel to Phase 2 with a second.

Phases 0 and 1 deliver most of the risk reduction. If the work is ever cut short, cut from the bottom.

## 5. Scorecard

Track these; they are all countable from the repo with one command each.

| Metric | Today | Target |
|---|---|---|
| API-layer LOC | ~4,900 | ~3,000 |
| Exported hooks | 305 | ~200 (factory-generated not counted) |
| Modules using `createResource` | 0 / 38 | ≥ 28 / 38 |
| Modules using `createKeys` | 0 / 38 | 38 / 38 |
| `keys.all()` invalidations | 102 / 171 | < 20 / 171 |
| Duplicate toasts per failure | 2 | 1 |
| Test files | 0 | ≥ 45 |
| `core/` + `client/` coverage | 0% | 100% |
| Modules missing from barrel | 3 | 0 |
| Hand-written response types | all | 5 modules zod-guarded, rest codegen |

## 6. What not to do

Worth stating explicitly, because each is a plausible-sounding trap:

- **Do not rewrite the layer.** The module boundaries are right. Rewriting throws away 38 correct endpoint maps to fix problems that are all local.
- **Do not swap React Query.** It is not the problem; it is under-used.
- **Do not put tokens in Redux/Zustand.** `TokenManager` is fine. The real hardening is httpOnly refresh cookies, which needs the backend — raise it, don't work around it.
- **Do not add a generic `useApi()` hook.** It sounds like less boilerplate and produces untyped, uncacheable calls. The factory is the correct abstraction because it preserves per-resource types.
- **Do not migrate all 38 modules in one PR.** Nobody can review it, and a bad merge takes down data access for the whole app.
