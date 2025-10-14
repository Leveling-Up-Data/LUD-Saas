# React Hooks

## `useIsMobile()`
- Returns: `boolean` indicating whether viewport width is below 768px.
- Behavior: Subscribes to `matchMedia` changes and updates state; returns `false` until initial effect runs, then `true/false`.

### Usage
```tsx
import { useIsMobile } from '@/hooks/use-mobile'

export function Layout() {
  const isMobile = useIsMobile()
  return <div className={isMobile ? 'p-2' : 'p-6'}>Responsive content</div>
}
```

## `useToast()` and `toast()`
- State-driven toast system with programmatic API.
- `useToast()` returns `{ toasts, toast, dismiss }`.
- `toast({...})` creates a toast and returns `{ id, update, dismiss }`.
- Renders with `Toaster` component from `@/components/ui/toaster`.

### Usage
```tsx
import { Toaster } from '@/components/ui/toaster'
import { useToast, toast } from '@/hooks/use-toast'

export function Example() {
  const { dismiss } = useToast()

  return (
    <div>
      <button
        onClick={() => {
          const t = toast({ title: 'Saved', description: 'Profile updated' })
          setTimeout(() => t.update({ description: 'All set!' }), 1000)
          setTimeout(() => dismiss(t.id), 2000)
        }}
      >Notify</button>
      <Toaster />
    </div>
  )
}
```

### Notes
- `TOAST_LIMIT` is set to 1; new toasts replace previous.
- `TOAST_REMOVE_DELAY` controls auto-removal after dismiss.
