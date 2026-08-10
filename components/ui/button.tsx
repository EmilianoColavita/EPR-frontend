import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-epr-green focus-visible:ring-offset-2 focus-visible:ring-offset-epr-dark disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-epr-green text-epr-dark hover:bg-epr-green/90",
        outline:
          "border border-white/25 bg-transparent text-foreground hover:border-white/60 hover:bg-white/5",
        ghost: "bg-transparent text-foreground hover:bg-white/10",
      },
      size: {
        default: "h-12 px-6 text-sm",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-base",
      },
      font: {
        display: "font-display",
        heading: "font-heading font-semibold",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      font: "display",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, font, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, font, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
