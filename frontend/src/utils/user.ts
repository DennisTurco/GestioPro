export function getInitials(name: string, surname: string): string {
  return `${name?.[0] ?? ''}${surname?.[0] ?? ''}`.toUpperCase()
}

const AVATAR_COLORS = ['#4f8ef7', '#e05c97', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6', '#f97316']

export function avatarColor(seed: string | number): string {
  if (typeof seed === 'number') return AVATAR_COLORS[seed % AVATAR_COLORS.length]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
