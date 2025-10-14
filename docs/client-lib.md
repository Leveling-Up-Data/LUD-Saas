## Client Library

### PocketBase client
`client/src/lib/pocketbase.ts` exports a configured PocketBase client `pb` and a subclass `PocketBaseClient` with convenience methods.

#### Types
```ts
export interface AuthData {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    created: string;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    amount: number;
    trialEnd?: string;
  };
}
```

#### Methods
- `pb.authWithPassword(email: string, password: string): Promise<AuthData>`
- `pb.create(email: string, password: string, username: string, name: string): Promise<AuthData['user']>`
- `pb.refresh(): Promise<AuthData | null>` (auto-called in browser on load)
- `pb.logout(): void`
- `pb.isValid: boolean`

Example:
```ts
import { pb } from "@/lib/pocketbase";

await pb.authWithPassword("jane@example.com", "password123");
if (pb.isValid) {
  console.log("Hello", pb.authStore.model?.username);
}
```

### React Query helpers
Defined in `client/src/lib/queryClient.ts`.

- `apiRequest(method, url, data?) => Promise<Response>`
```ts
const res = await apiRequest("POST", "/api/something", { foo: "bar" });
const json = await res.json();
```

- `getQueryFn({ on401: 'returnNull' | 'throw' }) => QueryFunction`
```ts
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

const queryFn = getQueryFn({ on401: "returnNull" });
const { data } = useQuery({ queryKey: ["/api/health"], queryFn });
```

- `queryClient: QueryClient` with sensible defaults. Use it with `QueryClientProvider`.

### Utility: `cn`
Defined in `client/src/lib/utils.ts`.

- `cn(...inputs: ClassValue[]) => string`
Combines class names using `clsx` and `tailwind-merge`.
```ts
import { cn } from "@/lib/utils";
<div className={cn("p-4", isActive && "bg-primary")} />
```