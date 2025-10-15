## Components

This project ships two categories of components: App components and UI primitives.

- App components: `Navbar`, `AuthModal`, `PricingCard`, `Chatbot`, `Toaster`
- UI primitives: Located in `client/src/components/ui/*`, exported with named exports.

### App Components

#### `Navbar`
Location: `client/src/components/navbar.tsx`

Displays navigation, authentication actions and user avatar/menus. Integrates with PocketBase to show current user and sign out.

Props: none

Usage:
```tsx
import { Navbar } from "@/components/navbar";

export function Layout() {
  return (
    <>
      <Navbar />
      {/* page content */}
    </>
  );
}
```

#### `AuthModal`
Location: `client/src/components/auth-modal.tsx`

Sign in / Sign up modal using PocketBase `pb` client.

Props:
- `open: boolean`
- `mode: 'signin' | 'signup'`
- `onClose(): void`
- `onModeChange(mode): void`
- `onSuccess?(): void`

Usage:
```tsx
import { AuthModal } from "@/components/auth-modal";

<AuthModal open={open} mode="signup" onClose={onClose} onModeChange={setMode} />
```

#### `PricingCard`
Location: `client/src/components/pricing-card.tsx`

Card that displays a `Product` and calls `onSelect` when chosen.

Props:
- `product: Product` (from `@shared/schema`)
- `isPopular?: boolean`
- `onSelect(product: Product): void`

Usage:
```tsx
import { PricingCard } from "@/components/pricing-card";
import type { Product } from "@shared/schema";

function PricingList({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <PricingCard key={p.id} product={p} onSelect={() => { /* ... */ }} />
      ))}
    </div>
  );
}
```

#### `Chatbot`
Location: `client/src/components/chatbot.tsx`

Floating chat widget that sends text and files to a configured backend webhook.

Props: none

Usage:
```tsx
import { Chatbot } from "@/components/chatbot";

<Chatbot />
```

#### `Toaster`
Location: `client/src/components/ui/toaster.tsx`

Renders toasts produced by `useToast`.

Props: none

Usage:
```tsx
import { Toaster } from "@/components/ui/toaster";
<Toaster />
```

### UI Primitives
Located in `client/src/components/ui/*`. Each file exports named components. Below are commonly used ones; consult the file for the full surface.

- `Button`, `buttonVariants`
- `Input`
- `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`
- `Label`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Toast`, `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastClose`, `ToastAction`
- `Badge`
- `Checkbox`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- `Select`, `SelectTrigger`, `SelectContent`, ...
- `DropdownMenu`, `Popover`, `Sheet`, `Drawer`, `Form`, `Table`, `Pagination`, etc.

Examples:

Button variants and sizes:
```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small</Button>
<Button size="icon" aria-label="Like">❤️</Button>
```

Input with label:
```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="you@example.com" />
```

Card layout:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Profile</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```
