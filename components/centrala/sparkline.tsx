export function Sparkline({ wartosci, opis }: { wartosci: number[]; opis: string }) {
  const max = Math.max(1, ...wartosci);
  const w = 120;
  const h = 36;
  const pkt = wartosci.map((v, i) => `${(i / (wartosci.length - 1)) * w},${h - 3 - (v / max) * (h - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={opis} className="h-9 w-32">
      <polyline points={pkt} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
