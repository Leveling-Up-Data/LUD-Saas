import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

export function Toaster() {
  const { toasts } = useToast()
  const anyOpen = toasts.some((t) => t.open !== false)

  return (
    <ToastProvider>
      {anyOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50" />
      )}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <div className="mt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => props.onOpenChange?.(false)}>
                OK
              </Button>
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
