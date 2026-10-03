import { cn } from "@/lib/utils";

export function Chip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border-2 border-line bg-card px-3 py-0.5 text-sm font-medium", className)}
      {...props}
    />
  );
}
