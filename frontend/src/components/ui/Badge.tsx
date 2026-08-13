interface BadgeProps {
  text: string
  cls: string
}

export default function Badge(badge: BadgeProps) {
  return <span className={`badge ${badge.cls}`}>{badge.text}</span>
}
