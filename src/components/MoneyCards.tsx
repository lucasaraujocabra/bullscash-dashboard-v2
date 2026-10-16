import { lazy, Suspense } from 'react'
import { ArrowRight, CircleNotch, Vault, Wallet, ArrowDownLeft } from '@phosphor-icons/react'
import { balance, settlement, kpis } from '../lib/data'
import { Money, CardHead } from './ui'
import { money } from '../lib/format'

const Orb = lazy(() => import('./Orb'))

const total = balance.available + balance.pending + balance.reserve
const PARTS = [
  { label: 'Disponível', value: balance.available, color: 'var(--color-brand)' },
  { label: 'A liberar', value: balance.pending, color: 'var(--color-brand-data)' },
  { label: 'Reserva', value: balance.reserve, color: 'rgb(255 255 255 / .22)' },
]

/* Poeira de luz atrás da esfera. Posições fixas. */
const DUST = [[12, 22], [22, 64], [31, 30], [44, 14], [58, 40], [67, 18], [78, 58], [86, 26], [91, 70], [8, 78], [52, 72], [38, 52]]

export function BalanceCard() {
  return (
    <section aria-labelledby="saldo-h" className="card flex h-full flex-col p-6">
      <CardHead tile={<Vault size={20} weight="light" />} label="Carteira Bulls" title="Saldo total" id="saldo-h"
        right={<span className="chip !h-8 shrink-0 !px-3 text-[12.5px]">BRL</span>} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <Money value={total} className="text-[clamp(36px,3.4vw,48px)] font-light leading-none" />
        <div className="text-[13px] leading-5 sm:text-right">
          <p className="text-fg-3">Entrou hoje, já sem taxas</p>
          <p className="flex items-center gap-1 font-medium text-up sm:justify-end"><ArrowDownLeft size={14} weight="bold" aria-hidden />{money(kpis.net)}</p>
        </div>
      </div>

      {/* Do que o saldo é feito: a pergunta que um lojista faz antes de sacar. */}
      <div className="mt-6">
        <div className="flex h-2 gap-1" aria-hidden>
          {PARTS.map(p => <span key={p.label} className="min-w-2 rounded-full" style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
          {PARTS.map(p => (
            <div key={p.label}>
              <dt className="flex items-center gap-2 text-[12.5px] text-fg-3"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.label}</dt>
              <dd className="mt-1 truncate text-[13px] font-medium tabular-nums sm:text-[14px]">{money(p.value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mt-6 flex min-h-[224px] flex-1 flex-col overflow-hidden rounded-2xl border border-[rgb(140_120_255/.16)]"
        style={{ background: 'radial-gradient(90% 80% at 50% 105%, #2a1b6b 0%, #120d2c 45%, #0c0b18 100%)' }}>
        {DUST.map(([x, y], i) => (
          <span key={i} aria-hidden className="absolute h-[3px] w-[3px] rounded-full bg-white"
            style={{ left: `${x}%`, top: `${y}%`, opacity: 0.12 + (i % 4) * 0.07 }} />
        ))}
        {/* a esfera tem área própria abaixo do texto: em tela estreita ela não passa por cima da frase */}
        <div className="relative order-last min-h-[160px] flex-1"><Suspense fallback={null}><Orb /></Suspense></div>
        <div className="relative flex items-start justify-between gap-4 p-6 pb-0">
          <div>
            <p className="text-[15px] font-medium text-fg">Liquidação automática</p>
            <p className="mt-1 text-[13px] leading-5 text-fg-2">Cada venda conferida com a adquirente<br className="hidden sm:block" /> antes de virar saldo.</p>
          </div>
          <p className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[12.5px] text-fg-2 backdrop-blur" role="status">
            <CircleNotch size={14} className="spin text-brand-data" aria-hidden /> 4 lotes
          </p>
        </div>
      </div>
    </section>
  )
}

export function WithdrawCard() {
  const next = settlement.slice(1, 4)
  return (
    <section aria-labelledby="saque-h" className="card flex h-full flex-col overflow-hidden p-6"
      style={{ background: 'radial-gradient(90% 40% at 100% 100%, rgb(107 49 253 / .2), transparent 70%), linear-gradient(180deg, rgb(255 255 255 / .025), transparent 120px), var(--color-card)' }}>
      <CardHead tile={<Wallet size={20} weight="light" />} label="Itaú · 4421" title="Para saque" id="saque-h"
        right={<button type="button" className="icon-btn shrink-0" aria-label="Abrir extrato"><ArrowRight size={14} /></button>} />

      <div className="mt-6">
        <Money value={balance.available} className="text-[32px] font-medium leading-none" />
        <p className="mt-2 flex items-center gap-2 text-[13px] text-fg-3">
          <span className="rounded-md bg-gradient-to-b from-[#f0cf7a] to-[#c8952f] px-2 py-0.5 text-[11.5px] font-semibold text-[#2a1c05] shadow-[inset_0_1px_0_rgb(255_255_255/.4)]">D+0</span>
          Pix liquidado, livre agora
        </p>
      </div>

      <div className="mt-6 border-t border-white/[.06] pt-6">
        <p className="text-[12.5px] text-fg-3">Próximas liberações</p>
        <ol className="relative mt-4 flex flex-col gap-4">
          <span aria-hidden className="absolute bottom-2 left-[3px] top-2 w-px bg-white/10" />
          {next.map((s, i) => (
            <li key={s.label} className="relative flex items-center gap-4 pl-6">
              <span aria-hidden className={`absolute left-0 h-2 w-2 rounded-full ${i === 0 ? 'bg-brand-data' : 'border border-white/30 bg-card'}`} />
              <span className="min-w-0 leading-5">
                <span className="block text-[13px] text-fg">{s.date}</span>
                <span className="block truncate text-[12px] text-fg-3">{s.origin}</span>
              </span>
              <span className="ml-auto shrink-0 text-[13px] font-medium tabular-nums">{money(s.amount)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
        <button type="button" className="btn-ghost !h-10">Agendar</button>
        <button type="button" className="btn-white whitespace-nowrap">Sacar</button>
      </div>
    </section>
  )
}
