import { cn } from "@/lib/utils";

export function Chip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border border-line-soft bg-soft px-3 py-0.5 text-sm font-semibold text-fg", className)}
      {...props}
    />
  );
}
