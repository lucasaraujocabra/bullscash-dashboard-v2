import { lazy, Suspense } from 'react'
import { ArrowUpRight, ArrowRight, Question, CircleNotch, Lightning } from '@phosphor-icons/react'
import { balance, settlement, series30d } from '../lib/data'
import { Money, Delta, SectionHead } from './ui'
import { money } from '../lib/format'

const Orb = lazy(() => import('./Orb'))

const total = balance.available + balance.pending
const dailyAvg = series30d.reduce((s, p) => s + p.value, 0) / series30d.length

/* Poeira de luz atrás da esfera (os pontinhos da ref 1). Posições fixas. */
const DUST = [[12, 22], [22, 64], [31, 30], [44, 14], [58, 40], [67, 18], [78, 58], [86, 26], [91, 70], [8, 78], [52, 72], [38, 52]]

export function BalanceCard() {
  return (
    <section aria-labelledby="saldo-h" className="flex flex-col">
      <SectionHead
        title="Saldo total"
        sub={<>Disponível somado ao que está <span className="text-fg-2">a liberar</span></>}
        right={<button type="button" className="chip !h-9 shrink-0 text-[13px]">BRL</button>}
      />
      <div className="card flex flex-1 flex-col p-5 sm:p-6">
        <h3 id="saldo-h" className="sr-only">Saldo total</h3>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <Money value={total} className="text-[clamp(34px,3.4vw,46px)] font-light leading-none" />
          <div className="text-right text-[12.5px] leading-relaxed text-fg-3">
            Comparado ao mês passado
            <div className="mt-1 flex justify-end"><Delta value={4.12} /></div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[13.5px]">
          <p className="flex items-center gap-1.5 text-fg-3">
            Média por dia: <span className="font-medium text-fg">{money(dailyAvg)}</span>
            <ArrowUpRight size={14} className="text-brand-fg" aria-hidden />
          </p>
          <button type="button" className="flex items-center gap-1.5 text-fg-2 transition-colors hover:text-fg">
            <Question size={17} aria-hidden /> Como é calculado?
          </button>
        </div>

        <div className="relative mt-5 min-h-[230px] flex-1 overflow-hidden rounded-[18px] border border-[rgb(140_120_255/.16)]"
          style={{ background: 'radial-gradient(90% 80% at 50% 105%, #2a1b6b 0%, #120d2c 45%, #0c0b18 100%)' }}>
          {DUST.map(([x, y], i) => (
            <span key={i} aria-hidden className="absolute h-[3px] w-[3px] rounded-full bg-white"
              style={{ left: `${x}%`, top: `${y}%`, opacity: 0.12 + (i % 4) * 0.07 }} />
          ))}
          <Suspense fallback={null}><Orb /></Suspense>
          <div className="relative px-5 pt-5 text-center">
            <p className="text-[16px] font-medium text-brand-data">Conciliação automática</p>
            <p className="mt-1.5 flex items-center justify-center gap-2 text-[13.5px] text-fg-2" role="status">
              <CircleNotch size={15} className="spin text-fg" aria-hidden /> conferindo 4 lotes com as adquirentes…
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function WithdrawCard() {
  const next = settlement.slice(1, 4)
  return (
    <section aria-labelledby="saque-h" className="card flex flex-col overflow-hidden p-5 sm:p-6"
      style={{ background: 'radial-gradient(80% 50% at 100% 100%, rgb(107 49 253 / .22), transparent 70%), linear-gradient(180deg, rgb(255 255 255 / .025), transparent 120px), var(--color-card)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="saque-h" className="text-[15px] font-medium">Para saque</h3>
          <p className="mt-0.5 text-[12.5px] text-fg-3">Itaú · conta 4421</p>
        </div>
        <button type="button" className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-fg transition-colors hover:text-brand-data">
          Extrato <ArrowRight size={14} aria-hidden />
        </button>
      </div>

      <div className="mt-5 grid h-11 place-items-center whitespace-nowrap rounded-xl border border-white/[.09] bg-gradient-to-b from-[#2b2b31] to-[#202025] text-[13.5px] text-fg-2 shadow-[inset_0_1px_0_rgb(255_255_255/.08)]">
        Próxima liberação: 19/10
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Lightning size={18} weight="fill" className="shrink-0 text-fg" aria-hidden />
        <Money value={balance.available} className="text-[clamp(22px,1.8vw,26px)] font-medium leading-none" />
      </div>
      <p className="mt-2.5 flex items-center gap-2 text-[13px] text-fg-3">
        <span className="rounded-md bg-gradient-to-b from-[#f0cf7a] to-[#c8952f] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#2a1c05] shadow-[inset_0_1px_0_rgb(255_255_255/.4)]">D+0</span>
        Pix liquidado hoje
      </p>

      <ul className="mt-5 grid gap-3 border-t border-white/[.06] pt-4" aria-label="A liberar">
        {next.map(s => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="min-w-0 leading-tight">
              <span className="block text-[13px] text-fg-2">{s.date}</span>
              <span className="block truncate text-[12px] text-fg-3">{s.origin}</span>
            </span>
            <span className="shrink-0 text-[13px] font-medium tabular-nums">{money(s.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <button type="button" className="text-[14px] text-fg-3 transition-colors hover:text-fg">Agendar</button>
        <button type="button" className="btn-white whitespace-nowrap">Sacar agora</button>
      </div>
    </section>
  )
}
