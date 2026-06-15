import * as React from "react"

import { cn } from "@/lib/utils"

type InputGroupSize = "default" | "xl"

const inputGroupSizeClasses: Record<InputGroupSize, string> = {
  default: "h-9 text-base md:text-sm",
  xl: "h-14 text-2xl md:text-2xl",
}

const inputGroupAddonSizeClasses: Record<InputGroupSize, string> = {
  default: "px-2.5 text-base md:text-sm",
  xl: "pl-4 pr-1 text-2xl md:text-2xl",
}

function InputGroup({
  className,
  inputGroupSize = "default",
  ...props
}: React.ComponentProps<"div"> & {
  inputGroupSize?: InputGroupSize
}) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        inputGroupSizeClasses[inputGroupSize],
        className
      )}
      {...props}
    />
  )
}

function InputGroupAddon({
  className,
  inputGroupSize = "default",
  ...props
}: React.ComponentProps<"span"> & {
  inputGroupSize?: InputGroupSize
}) {
  return (
    <span
      data-slot="input-group-addon"
      className={cn(
        "flex shrink-0 items-center whitespace-nowrap text-muted-foreground",
        inputGroupAddonSizeClasses[inputGroupSize],
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input-group-input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-0 py-3 text-inherit outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupInput }
