export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('it-IT')
}

export function toDateInput(iso: string | undefined | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}