# Application Components

## `AuthModal`
- Props:
  - `open: boolean`
  - `mode: 'signin' | 'signup'`
  - `onClose: () => void`
  - `onModeChange: (mode: 'signin' | 'signup') => void`
  - `onSuccess?: () => void`
- Behavior: Handles user sign up and sign in via PocketBase; shows terms checkbox on signup; shows toasts for success/error; redirects by default to `/pricing` (signup) or `/dashboard` (signin) when `onSuccess` not provided.

### Usage
```tsx
import { AuthModal } from '@/components/auth-modal'

export function AuthExample() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Auth</button>
      <AuthModal
        open={open}
        mode="signup"
        onClose={() => setOpen(false)}
        onModeChange={(m) => console.log('mode', m)}
        onSuccess={() => console.log('Authed!')}
      />
    </>
  )
}
```

## `Chatbot`
- Floating chat widget with text and file input. Sends requests to a backend webhook, displays responses and optional file links.

### Usage
```tsx
import { Chatbot } from '@/components/chatbot'

export function Layout() {
  return (
    <>
      {/* page content */}
      <Chatbot />
    </>
  )
}
```

## `Navbar`
- Displays brand, links, auth actions; integrates with PocketBase auth to show user state.

### Usage
```tsx
import { Navbar } from '@/components/navbar'

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
```

## `PricingCard`
- Props:
  - `product: Product`
  - `isPopular?: boolean`
  - `onSelect(product: Product): void`
- Renders a plan tile with features and CTA.

### Usage
```tsx
import { PricingCard } from '@/components/pricing-card'
import type { Product } from '@shared/schema'

function Pricing({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <PricingCard key={p.id} product={p} isPopular={p.name === 'Professional'} onSelect={(prod) => console.log('select', prod)} />
      ))}
    </div>
  )
}
```
