import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export const przycisk = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 font-semibold text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:shrink-0",
  {
    variants: {
      wariant: {
        glowny: "border-primary bg-primary text-primary-fg hover:brightness-110",
        obrys: "border-fg bg-card text-fg hover:bg-fg hover:text-bg",
        cichy: "border-transparent bg-transparent text-fg underline hover:bg-fg/10",
        zloty: "border-accent bg-accent text-accent-fg hover:brightness-105",
      },
      rozmiar: {
        md: "min-h-12 px-5 py-2 text-base",
        lg: "min-h-14 px-7 py-3 text-lg",
        ikona: "size-12",
      },
    },
    defaultVariants: { wariant: "glowny", rozmiar: "md" },
  },
);

type Props = React.ComponentProps<"button"> & VariantProps<typeof przycisk> & { asChild?: boolean };

export function Button({ className, wariant, rozmiar, asChild, ...props }: Props) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(przycisk({ wariant, rozmiar }), className)} {...props} />;
}
