## React Hooks

### `useToast`
Location: `client/src/hooks/use-toast.ts`

Provides an imperative toast API and state used by the UI Toaster.

- Exports: `useToast`, `toast`
- Usage:
```tsx
import { Toaster } from "@/components/ui/toaster";
import { useToast, toast } from "@/hooks/use-toast";

function Example() {
  const { dismiss } = useToast();

  return (
    <>
      <button
        onClick={() =>
          toast({ title: "Saved", description: "We saved your changes." })
        }
      >
        Show toast
      </button>
      <button onClick={() => dismiss()}>Dismiss all</button>
      <Toaster />
    </>
  );
}
```

Notes:
- Only one toast is shown at a time (`TOAST_LIMIT = 1`).
- Toasts auto-remove after a long delay (customizable).

### `useIsMobile`
Location: `client/src/hooks/use-mobile.tsx`

Responsive helper to detect whether viewport width is below 768px.

- Export: `useIsMobile(): boolean`
- Usage:
```tsx
import { useIsMobile } from "@/hooks/use-mobile";

function Layout() {
  const isMobile = useIsMobile();
  return <div>{isMobile ? "Mobile" : "Desktop"}</div>;
}
```