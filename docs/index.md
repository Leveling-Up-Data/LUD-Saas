## Documentation Index

- [Server APIs](./server.md)
- [PocketBase Hooks and Routes](./pocketbase.md)
- [Shared Schema and Types](./shared-schema.md)
- [Client Library (PocketBase client, Query, utilities)](./client-lib.md)
- [React Hooks](./hooks.md)
- [Components (App and UI library)](./components.md)

### Quick start

- Client setup:
```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

export function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... your app ... */}
      <Toaster />
    </QueryClientProvider>
  );
}
```

- Server endpoints are mounted under `/api/*`. See [Server APIs](./server.md).
- When using PocketBase, enable the custom routes in your PocketBase hooks. See [PocketBase Hooks](./pocketbase.md).