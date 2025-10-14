# UI Components

These components are adapted from Radix UI and shadcn/ui patterns. Below are common exports and example usage. For advanced props, refer to each file in `client/src/components/ui/`.

## Buttons
- Exports: `Button`, `buttonVariants`
- Usage:
```tsx
import { Button } from '@/components/ui/button'

<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small</Button>
```

## Cards
- Exports: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`
- Usage:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Body</CardContent>
</Card>
```

## Forms
- Exports: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `FormDescription`, `useFormField`

## Inputs
- Exports: `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Select` and subcomponents

## Feedback
- Exports: `Alert`, `Toast` and subcomponents, `Toaster`, `Progress`, `Skeleton`

## Overlays
- Exports: `Dialog`, `AlertDialog`, `Drawer`, `Sheet`, `Popover`, `Tooltip`

## Navigation
- Exports: `Tabs`, `Menubar`, `NavigationMenu`, `Breadcrumb`, `Pagination`, `Sidebar`

## Layout
- Exports: `Accordion`, `Collapsible`, `ScrollArea`, `Separator`, `Resizable`

## Media & Display
- Exports: `Avatar`, `Badge`, `Carousel`, `Chart`, `AspectRatio`, `Table`, `Toggle`, `ToggleGroup`

### Notes
- Many components re-export compound parts; import only what you need.
- All components accept `className` for styling and are Tailwind-ready.
