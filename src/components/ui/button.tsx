import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background/40 backdrop-blur-md hover:bg-accent/10 hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-white/5 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-brand text-primary-foreground font-semibold shadow-[0_8px_30px_oklch(0.7_0.22_295/0.45)] hover:shadow-[0_12px_40px_oklch(0.7_0.22_295/0.6)] hover:-translate-y-0.5",
        glass: "glass text-foreground hover:bg-white/10 hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-7 text-sm",
        xl: "h-14 rounded-full px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
