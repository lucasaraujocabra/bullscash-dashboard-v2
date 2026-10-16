import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TrendUp, TrendDown } from '@phosphor-icons/react'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/* Separa símbolo, inteiro e centavos para o tratamento tipográfico da marca. */
export function Money({ value, className = '', cents = true }: { value: number; className?: string; cents?: boolean }) {
  const parts = brl.formatToParts(value)
  const int = parts.filter(p => p.type === 'integer' || p.type === 'group').map(p => p.value).join('')
  const frac = parts.find(p => p.type === 'fraction')?.value ?? '00'
  return (
    <span className={`money ${className}`} aria-label={brl.format(value)}>
      <span className="sym" aria-hidden>R$</span>
      <span aria-hidden>{value < 0 ? '-' : ''}{int}</span>
      {cents && <span className="cents" aria-hidden>,{frac}</span>}
    </span>
  )
}

export function Delta({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const up = value >= 0
  const Icon = up ? TrendUp : TrendDown
  return (
    <span className={`delta ${up ? 'up' : 'down'}`}>
      <Icon size={13} weight="bold" aria-hidden />
      {up ? '+' : '-'}{Math.abs(value).toFixed(2).replace('.', ',')}{suffix}
    </span>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(o => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )
}

/* Avatar de iniciais com tom estável por nome: sem foto real, sem inventar rosto. */
const HUES = [262, 222, 198, 160, 32, 340, 280, 12]
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('')
  const h = HUES[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % HUES.length]
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-white/90"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: `linear-gradient(140deg, hsl(${h} 45% 42%), hsl(${h} 50% 22%))`,
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / .18), 0 0 0 2px var(--color-card)',
      }}
    >{initials}</span>
  )
}

export function SectionHead({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-fg">{title}</h2>
        {sub && <p className="mt-1 text-[13.5px] text-fg-3">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}
