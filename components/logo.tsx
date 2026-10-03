// Znak "Splot": trzy nici splecione w węzeł-serce.
export function Logo({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false" fill="none" strokeWidth="4.5" strokeLinecap="round">
      <path d="M24 41C10 31 7 22 11 15c4-6 11-5 13 1 2-6 9-7 13-1 4 7 1 16-13 26Z" stroke="currentColor" />
      <path d="M11 15c5 5 8 12 13 26M37 15c-5 5-8 12-13 26" stroke="#B3203A" />
      <path d="M15 12c6 3 12 3 18 0" stroke="#D9A21B" />
    </svg>
  );
}
