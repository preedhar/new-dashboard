import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="bottom-center"
      style={
        {
          "--normal-bg": "var(--success)",
          "--normal-text": "var(--success-foreground)",
          "--normal-border": "var(--success-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
