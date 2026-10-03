// Dekoracja: trzy nici splecione w jedną linię. Czysto ozdobna, ukryta przed czytnikami ekranu.
export function NiciSplotu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 420" className={className} aria-hidden="true" focusable="false" fill="none" strokeLinecap="round" preserveAspectRatio="xMidYMid slice">
      <path d="M-20 300C120 120 220 120 340 240S560 380 820 120" stroke="#D9A21B" strokeWidth="3" opacity="0.55" />
      <path d="M-20 120C120 320 240 340 360 200S580 40 820 300" stroke="#B3203A" strokeWidth="3" opacity="0.8" />
      <path d="M-20 210C140 60 260 80 380 210S600 360 820 210" stroke="#FFFFFF" strokeWidth="2" opacity="0.35" />
    </svg>
  );
}
