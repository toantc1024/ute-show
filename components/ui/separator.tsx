import * as React from "react"

import { cn } from "@/lib/utils"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "presentation" : undefined}
      className={cn("h-px w-full bg-border/50", className)}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }
