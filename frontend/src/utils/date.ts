export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('it-IT')
}
