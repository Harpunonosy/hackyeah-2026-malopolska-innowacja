import { cn } from "@/lib/utils";

export function Strona({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("kontener space-y-10 py-10 sm:py-14", className)}>{children}</div>;
}
