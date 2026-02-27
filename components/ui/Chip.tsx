import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Chip({
  children,
  active,
  className,
  ...props
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn("ui-chip", active && "ui-chip-active", className)}
      {...props}
    >
      {children}
    </button>
  );
}
