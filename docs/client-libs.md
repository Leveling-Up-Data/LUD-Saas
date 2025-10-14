# Client Libraries

## `@/lib/pocketbase`

### Exports
- `class PocketBaseClient extends PocketBase`
  - **Methods**:
    - `authWithPassword(email: string, password: string): Promise<AuthData>`
      - Authenticates with PocketBase `users` collection, then returns `user` plus latest `subscription` (if any).
    - `create(email: string, password: string, username: string, name: string): Promise<AuthData['user']>`
      - Registers a new user in PocketBase.
    - `refresh(): Promise<AuthData | null>`
      - Attempts to refresh auth and returns user + subscription when valid.
    - `logout(): void`
      - Clears auth store.
    - `get isValid: boolean`
      - Accessor for auth validity.
- `pb: PocketBaseClient`
  - Singleton instance configured with `VITE_POCKETBASE_URL` (falls back to production URL).
- `type AuthData`
  - `{ user: { id, username, email, name, stripeCustomerId?, stripeSubscriptionId?, created }, subscription?: { id, plan, status, currentPeriodEnd, amount, trialEnd? } }`

### Usage
```ts
import { pb } from '@/lib/pocketbase'

// Sign up then sign in
await pb.create('jane@example.com', 'password123', 'jane', 'Jane Doe')
const auth = await pb.authWithPassword('jane@example.com', 'password123')
console.log(auth.user.name)

// Refresh on app load (already runs in lib)
const refreshed = await pb.refresh()

// Check auth state
if (pb.isValid) {
  // use pb.authStore.model
}

// Logout
pb.logout()
```

## `@/lib/queryClient`

### Exports
- `apiRequest(method: string, url: string, data?: unknown): Promise<Response>`
  - Fetch wrapper that throws on non-2xx responses.
- `getQueryFn<T>({ on401 }: { on401: 'returnNull' | 'throw' }): QueryFunction<T>`
  - Default React Query fetcher supporting 401-as-null behavior.
- `queryClient: QueryClient`
  - Preconfigured client: infinite staleTime, no retries, no refetch on focus.

### Usage
```ts
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { queryClient, getQueryFn } from '@/lib/queryClient'

function Products() {
  const { data } = useQuery({
    queryKey: ['api', 'products'],
    queryFn: getQueryFn<{ id: string; name: string }[]>({ on401: 'throw' }),
  })
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

## `@/lib/utils`

### Exports
- `cn(...inputs: ClassValue[]): string`
  - Tailwind utility: merges class names using `clsx` + `tailwind-merge`.

### Usage
```ts
import { cn } from '@/lib/utils'

<div className={cn('p-4', isActive && 'bg-primary')}>Hello</div>
```
