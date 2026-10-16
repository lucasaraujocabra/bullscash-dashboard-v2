import { CaretDown, Rows, CaretUpDown, PixLogo, CreditCard, Barcode, ArrowsLeftRight, Cardholder } from '@phosphor-icons/react'
import { methodShare, todayTx, METHOD_LABEL, STATUS_LABEL, type Method } from '../lib/data'
import { money, hour } from '../lib/format'
import { Avatar, CardHead } from './ui'

const COLOR: Record<Method, string> = { pix: 'var(--color-up)', card: 'var(--color-brand-data)', boleto: 'var(--color-wait)' }
const ICON: Record<Method, typeof PixLogo> = { pix: PixLogo, card: CreditCard, boleto: Barcode }

const lead = [...methodShare].sort((a, b) => b.share - a.share)[0]
const card = methodShare.find(m => m.method === 'card')!

export function MethodsCard() {
  return (
    <section className="card flex h-full flex-col p-6" aria-labelledby="meios-h">
      <CardHead tile={<Cardholder size={20} weight="light" />} label="Por meio, hoje" title="Pagamentos" id="meios-h" />

      <ul className="mt-6 flex flex-col gap-6">
        {methodShare.map(m => {
          const Icon = ICON[m.method]
          return (
            <li key={m.method}>
              <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-raised" style={{ color: COLOR[m.method] }}>
                <Icon size={16} weight="bold" aria-hidden />
              </span>
              <span className="min-w-0 leading-5">
                <span className="block text-[14px] text-fg">{METHOD_LABEL[m.method]}</span>
                <span className="block text-[12px] text-fg-3">{m.sales} vendas</span>
              </span>
              <span className="ml-auto text-right leading-5">
                <span className="block text-[14px] font-medium tabular-nums">{money(m.amount)}</span>
                <span className="block text-[12px] text-fg-3">{m.share.toFixed(0)}%</span>
              </span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/[.06]" aria-hidden>
                <div className="h-full rounded-full" style={{ width: `${m.share}%`, background: COLOR[m.method] }} />
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto pt-6"><p className="rounded-2xl border border-line bg-sunk p-4 text-[13px] leading-5 text-fg-2">
        <span className="text-fg">{METHOD_LABEL[lead.method]}</span> concentra {lead.share.toFixed(0)}% do dia. No cartão, o ticket médio é <span className="text-fg">{money(card.sales ? card.amount / card.sales : 0)}</span>.
      </p></div>
    </section>
  )
}

const ROWS = todayTx.slice(0, 6)

export function TransactionsCard() {
  return (
    <section className="card @container flex h-full flex-col p-6" aria-labelledby="tx-h">
      <CardHead tile={<ArrowsLeftRight size={20} weight="light" />} label="Hoje" title="Últimas transações" id="tx-h"
        right={
          <button type="button" className="chip !h-8 shrink-0 !px-3 text-[12.5px]">
            <Rows size={14} aria-hidden /> <span className="hidden sm:inline">6 em lista</span> <CaretDown size={12} aria-hidden />
          </button>
        } />

      {/* Tabela quando cabe; lista empilhada quando o cartão estreita. */}
      <div className="mt-6 hidden @[440px]:block">
        <table className="w-full border-separate border-spacing-y-1 text-[13.5px]">
          <thead>
            <tr className="text-left text-[12.5px] text-fg-3">
              <th className="px-4 pb-2 font-normal">Cliente</th>
              <th className="px-4 pb-2 font-normal">Status</th>
              <th className="px-4 pb-2 text-right font-normal"><span className="inline-flex items-center gap-1">Valor <CaretUpDown size={12} /></span></th>
              <th className="px-4 pb-2 text-right font-normal"><span className="sr-only">Ação</span></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(t => (
              <tr key={t.id} className="group h-16">
                <td className="rounded-l-2xl bg-sunk px-4 transition-colors group-hover:bg-raised">
                  <span className="flex items-center gap-3">
                    <Avatar name={t.customer} size={32} />
                    <span className="min-w-0 leading-5">
                      <span className="block truncate">{t.customer}</span>
                      <span className="block text-[12px] text-fg-3">{METHOD_LABEL[t.method]} · {hour(t.at)}</span>
                    </span>
                  </span>
                </td>
                <td className="bg-sunk px-4 transition-colors group-hover:bg-raised"><span className={`status ${t.status}`}>{STATUS_LABEL[t.status]}</span></td>
                <td className="bg-sunk px-4 text-right font-medium tabular-nums transition-colors group-hover:bg-raised">{money(t.amount)}</td>
                <td className="rounded-r-2xl bg-sunk px-4 text-right transition-colors group-hover:bg-raised">
                  {t.status === 'chargeback' || t.status === 'declined'
                    ? <button type="button" className="btn-ghost">{t.status === 'chargeback' ? 'Contestar' : 'Detalhes'}</button>
                    : <button type="button" className="btn-white sm">Ver</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 grid gap-2 @[440px]:hidden">
        {ROWS.map(t => (
          <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-sunk px-4 py-3">
            <Avatar name={t.customer} size={32} />
            <div className="min-w-0 leading-5">
              <p className="truncate text-[14px]">{t.customer}</p>
              <p className="text-[12.5px] text-fg-3">{METHOD_LABEL[t.method]} · {hour(t.at)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[14px] font-medium leading-5 tabular-nums">{money(t.amount)}</p>
              <span className={`status ${t.status} mt-1 !h-5 !px-2 !text-[11px]`}>{STATUS_LABEL[t.status]}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
