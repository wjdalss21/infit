import type { ReactNode } from 'react'
import styles from './Badge.module.scss'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

export default function Badge({ variant = 'primary', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
}
