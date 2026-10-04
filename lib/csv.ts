/** Cudzysłowy nie chronią Excela przed wykonaniem formuły. */
export function komorkaCsv(value: unknown): string {
  let text = String(value ?? "").replace(/\r?\n/g, " ");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}
