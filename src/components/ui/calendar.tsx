import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: cn(defaultClassNames.months, "relative flex flex-col gap-4 sm:flex-row"),
        month: cn(defaultClassNames.month, "flex flex-col gap-4"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "flex h-9 items-center justify-center",
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "flex items-center gap-1 text-sm font-medium",
        ),
        // Dropdown caption layout (captionLayout="dropdown"): the native selects
        // sit invisibly over their value labels, which show the month/year plus
        // a chevron.
        dropdowns: cn(defaultClassNames.dropdowns, "flex items-center gap-1.5"),
        dropdown_root: cn(
          defaultClassNames.dropdown_root,
          "relative inline-flex items-center rounded-md px-1.5 py-1 hover:bg-accent",
        ),
        dropdown: cn(
          defaultClassNames.dropdown,
          "absolute inset-0 h-full w-full cursor-pointer opacity-0",
        ),
        nav: cn(defaultClassNames.nav, "absolute inset-x-0 top-0 flex items-center justify-between"),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse"),
        weekdays: cn(defaultClassNames.weekdays, "flex"),
        weekday: cn(
          defaultClassNames.weekday,
          "w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground",
        ),
        week: cn(defaultClassNames.week, "mt-2 flex w-full"),
        day: cn(
          defaultClassNames.day,
          "relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        ),
        range_start: cn(defaultClassNames.range_start, "day-range-start rounded-l-md"),
        range_middle: cn(defaultClassNames.range_middle, "rounded-none"),
        range_end: cn(defaultClassNames.range_end, "day-range-end rounded-r-md"),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
        ),
        selected: cn(
          defaultClassNames.selected,
          "[&>button]:bg-primary [&>button]:text-foreground [&>button]:hover:bg-primary [&>button]:hover:text-foreground",
        ),
        today: cn(defaultClassNames.today, "[&>button]:bg-accent [&>button]:text-accent-foreground"),
        outside: cn(
          defaultClassNames.outside,
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        ),
        disabled: cn(defaultClassNames.disabled, "text-muted-foreground opacity-50"),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          if (orientation === "down") {
            return (
              <ChevronDown
                className={cn("size-3.5 text-muted-foreground", chevronClassName)}
                {...chevronProps}
              />
            )
          }
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className={cn("size-4", chevronClassName)} {...chevronProps} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
