import { useState, type KeyboardEvent } from 'react'
import styles from './InputBar.module.scss'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function InputBar({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState('')

  const send = () => {
    const t = value.trim()
    if (!t || disabled) return
    onSend(t)
    setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className={styles.bar}>
      <input
        className={styles.input}
        type="text"
        placeholder={disabled ? '' : '메시지를 입력하세요...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
      />
      <button className={styles.sendBtn} onClick={send} disabled={disabled || !value.trim()}>
        ➤
      </button>
    </div>
  )
}
