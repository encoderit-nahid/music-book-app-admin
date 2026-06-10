import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",

        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

        destructive:
          "border-transparent bg-destructive text-white hover:bg-destructive/90",

        outline:
          "border-border text-foreground hover:bg-accent hover:text-accent-foreground",

        /* ---- STATUS VARIANTS ---- */

        pending:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300",

        assigned:
          "border-transparent bg-blue-600 text-white hover:bg-blue-700",

        live:
          "border-transparent bg-purple-600 text-white hover:bg-purple-700",

        complete:
          "border-transparent bg-green-600 text-white hover:bg-green-700",

        incomplete:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
