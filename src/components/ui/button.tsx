import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ asChild, className, variant = "primary", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-accent text-black hover:bg-[#57ffac]",
        variant === "secondary" && "border border-border bg-white/5 text-foreground hover:bg-white/10",
        variant === "ghost" && "text-muted hover:bg-white/5 hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}
