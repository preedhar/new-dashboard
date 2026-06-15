import * as React from "react"

import { cn } from "@/lib/utils"

type InputSize = "default" | "xl"

type InputProps = React.ComponentProps<"input"> & {
  inputSize?: InputSize
}

const inputSizeClasses: Record<InputSize, string> = {
  default: "h-9 px-2.5 py-1 text-base md:text-sm",
  xl: "h-14 px-4 py-3 text-2xl md:text-2xl",
}

function Input({ className, inputSize = "default", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        inputSizeClasses[inputSize],
        className
      )}
      {...props}
    />
  )
}

export { Input }
