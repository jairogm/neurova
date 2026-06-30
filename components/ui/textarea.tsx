import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/15 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-20 w-full rounded-[9px] border bg-card px-3 py-2 text-base shadow-none transition-[color,box-shadow] outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-[13px]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
