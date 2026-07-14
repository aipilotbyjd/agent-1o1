# API Layer

Follows `docs/Structure.md` (`Herd/agent1o1FE/docs/Structure.md`) — module-per-resource pattern.

## Setup

Before this code compiles, install the runtime dependencies:

```bash
yarn add axios @tanstack/react-query
```

`react-toastify` is already present in `package.json`.

Also make sure `src/types/` contains the domain type files — they were copied from the parent project on setup. If any are missing, regenerate them from the backend or copy again from `../agent1o1FE/src/types/`.

## Provider setup

Wrap your app with the React Query provider using the factory from `core`:

```tsx
// src/Providers/Providers.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/api/core';

const queryClient = createQueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
```

Add `VITE_API_URL` to `.env`:

```
VITE_API_URL=https://agent1o1.test/api/v1
```

## Usage

```tsx
import { useWorkflows, useCreateWorkflow } from '@/api/modules/workflows';

const WorkflowsList = ({ workspaceId }: { workspaceId: string }) => {
	const { data, isLoading } = useWorkflows(workspaceId);
	const createMutation = useCreateWorkflow(workspaceId);
	// ...
};
```

Or import from the root barrel:

```tsx
import { useWorkflows, useCreateWorkflow } from '@/api';
```

## Rules (see `docs/Structure.md` §3)

1. One module per backend resource.
2. Services unwrap single responses via `unwrap()`, preserve paginated ones.
3. Hooks never import `react-toastify` — always use `@/api/core/notify`.
4. Hooks always forward `signal` — `({ signal }) => Service.x(..., signal)`.
5. Query keys live in `<module>.keys.ts`, co-located with the module.
6. All barrels use `export *`.
7. Endpoints are arrow functions returning strings.
8. Errors are `ApiError` instances — check with `ApiError.is(e)`.
9. Public surface is the module barrel.
