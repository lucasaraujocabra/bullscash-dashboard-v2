import type { ReactNode } from 'react'
import { CurrencyCircleDollar, Receipt, ShieldCheck, Ticket } from '@phosphor-icons/react'
import { kpis, counts, todayTx, transactions, NOW } from '../lib/data'
import { pct, plural } from '../lib/format'
import { Money, Delta } from './ui'

/* Estrutura da v1, que o Lucas pediu de volta: cabeçalho, fio, valor, fio, visual. Tudo em 8. */
function Kpi({ icon, label, value, delta, deltaSuffix, caption, children }: {
  icon: ReactNode; label: string; value: ReactNode; delta: number; deltaSuffix?: string; caption: string; children: ReactNode
}) {
  return (
    <article className="card flex h-full flex-col px-6">
      <header className="flex h-16 items-center gap-3 border-b border-white/[.06]">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-raised text-fg-2">{icon}</span>
        <h3 className="text-[14px] text-fg-2">{label}</h3>
      </header>
      <div className="py-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[28px] font-medium leading-8 tracking-[-0.035em] tabular-nums">{value}</p>
          <Delta value={delta} suffix={deltaSuffix} />
        </div>
        <p className="mt-2 text-[13px] leading-5 text-fg-3">{caption}</p>
      </div>
      <div className="mt-auto flex h-16 items-center border-t border-white/[.06]" aria-hidden>{children}</div>
    </article>
  )
}

const hourly = Array.from({ length: 24 }, (_, h) =>
  todayTx.filter(t => t.status === 'approved' && t.at.getHours() === h).reduce((s, t) => s + t.amount, 0))
const hMax = Math.max(...hourly) || 1

const ticket7 = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(NOW); d.setDate(NOW.getDate() - (6 - i))
  const a = transactions.filter(t => t.status === 'approved' && t.at.toDateString() === d.toDateString())
  return a.length ? a.reduce((s, t) => s + t.amount, 0) / a.length : 0
})

const TICK: Record<string, string> = { approved: 'bg-up', declined: 'bg-down', chargeback: 'bg-down', pending: 'bg-wait', refunded: 'bg-fg-3' }

export default function Kpis() {
  const tMin = Math.min(...ticket7), tMax = Math.max(...ticket7)
  const tLine = ticket7.map((v, i) => `${i ? 'L' : 'M'}${(i / 6) * 100},${28 - ((v - tMin) / (tMax - tMin || 1)) * 24}`).join('')
  const total = counts.approved + counts.declined + counts.pending

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 wide:grid-cols-4">
      <Kpi icon={<CurrencyCircleDollar size={18} />} label="Faturamento hoje"
        value={<Money value={kpis.gross} cents={false} />} delta={kpis.deltaVsYesterday}
        caption="Vendas aprovadas, antes das taxas">
        <div className="flex h-8 w-full items-end gap-[3px]">
          {hourly.map((v, h) => (
            <span key={h} className={`flex-1 rounded-[2px] ${h === 21 ? 'bg-brand-data' : 'bg-white/15'}`}
              style={{ height: `${Math.max(8, (v / hMax) * 100)}%`, opacity: h > 21 ? 0.35 : 1 }} />
          ))}
        </div>
      </Kpi>

      <Kpi icon={<Receipt size={18} />} label="Vendas"
        value={<>{kpis.sales}<span className="text-fg-3"> de {kpis.attempts}</span></>} delta={6.4}
        caption={`${plural(counts.declined, 'recusada', 'recusadas')} e ${plural(counts.pending, 'pendente', 'pendentes')} hoje`}>
        {/* a Fita da v1: um traço por tentativa, a mais nova à direita */}
        <div className="flex h-8 w-full items-center gap-[3px] overflow-hidden">
          {todayTx.slice(0, 44).reverse().map(t => <span key={t.id} className={`h-6 w-[3px] shrink-0 rounded-full ${TICK[t.status]}`} />)}
        </div>
      </Kpi>

      <Kpi icon={<ShieldCheck size={18} />} label="Aprovação"
        value={pct(kpis.approvalRate)} delta={-1.2} deltaSuffix=" p.p."
        caption="Aprovadas sobre todas as tentativas">
        <div className="w-full">
          <div className="flex h-2 w-full gap-1">
            <span className="rounded-full bg-up" style={{ width: `${(counts.approved / total) * 100}%` }} />
            <span className="rounded-full bg-down" style={{ width: `${(counts.declined / total) * 100}%` }} />
            <span className="rounded-full bg-wait" style={{ width: `${(counts.pending / total) * 100}%` }} />
          </div>
          <div className="mt-2 flex justify-between whitespace-nowrap text-[12px] tabular-nums text-fg-3">
            <span><span className="text-up">●</span> {counts.approved} aprov.</span><span><span className="text-down">●</span> {counts.declined} recus.</span><span><span className="text-wait">●</span> {counts.pending} pend.</span>
          </div>
        </div>
      </Kpi>

      <Kpi icon={<Ticket size={18} />} label="Ticket médio"
        value={<Money value={kpis.avgTicket} />} delta={3.4}
        caption="Média por venda aprovada hoje">
        <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full overflow-visible">
          <path d={tLine} fill="none" stroke="#a98fff" strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
      </Kpi>
    </div>
  )
}
