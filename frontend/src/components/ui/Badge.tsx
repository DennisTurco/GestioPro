interface BadgeProps {
  cls: string
  children: React.ReactNode
}

export default function Badge({ cls, children }: BadgeProps) {
  return <span className={`badge ${cls}`}>{children}</span>
}
