import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, DotsThreeVertical, CaretDown, Rows, CaretUpDown } from '@phosphor-icons/react'
import { methodShare, todayTx, METHOD_LABEL, STATUS_LABEL, ACQUIRERS, type Method } from '../lib/data'
import { money, hour, dayMonth } from '../lib/format'
import { Avatar } from './ui'
import { AcqMark } from './Acquirers'

const DOT: Record<Method, string> = { pix: '#5fc796', card: '#a98fff', boleto: '#e3b85f' }
const METHOD_DELTA: Record<Method, number> = { pix: 9.23, card: 7.59, boleto: -2.1 }

export function MethodsCard() {
  const track = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const n = methodShare.length
  const go = (d: number) => {
    const next = Math.min(Math.max(i + d, 0), n - 1)
    const el = track.current?.children[next] as HTMLElement | undefined
    track.current?.scrollTo({ left: el ? el.offsetLeft : 0, behavior: 'smooth' })
    setI(next)
  }
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="meios-h">
      <div className="flex items-center justify-between gap-3">
        <h3 id="meios-h" className="text-[16px] font-medium">Meios de pagamento</h3>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-[12.5px] tabular-nums text-fg-3">{String(i + 1).padStart(2, '0')} de {String(n).padStart(2, '0')}</span>
          <button type="button" className="icon-btn round" onClick={() => go(-1)} disabled={i === 0} aria-label="Anterior"><ArrowLeft size={14} /></button>
          <button type="button" className="icon-btn round !bg-fg !text-ink" onClick={() => go(1)} disabled={i === n - 1} aria-label="Próximo"><ArrowRight size={14} weight="bold" /></button>
        </div>
      </div>
      <div ref={track} className="no-scrollbar -mx-1 mt-4 flex snap-x snap-proximity gap-3 overflow-x-auto px-1 pb-1"
        onScroll={e => { const el = e.currentTarget; const w = (el.children[0] as HTMLElement)?.offsetWidth || 1; setI(Math.round(el.scrollLeft / (w + 12))) }}>
        {methodShare.map(m => (
          <article key={m.method} className="w-[calc(50%-6px)] min-w-[188px] shrink-0 snap-start rounded-[18px] border border-line bg-raised/60 p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[14.5px] font-medium"><span className="h-1.5 w-1.5 rounded-full" style={{ background: DOT[m.method] }} />{METHOD_LABEL[m.method]}</p>
              <button type="button" className="icon-btn !h-7 !w-7 !rounded-lg" aria-label={`Opções de ${METHOD_LABEL[m.method]}`}><DotsThreeVertical size={15} weight="bold" /></button>
            </div>
            <p className="mt-3 text-[18px] font-medium tabular-nums tracking-[-0.02em]">{money(m.amount)}</p>
            <p className="mt-1 text-[12.5px] text-fg-3"># {m.sales} vendas · {m.share.toFixed(0)}% do dia</p>
            <p className={`mt-0.5 text-[12px] ${METHOD_DELTA[m.method] >= 0 ? 'text-up' : 'text-down'}`}>{METHOD_DELTA[m.method] >= 0 ? '+' : '-'} {Math.abs(METHOD_DELTA[m.method]).toFixed(2).replace('.', ',')}%</p>
            <div className="mt-4 flex items-center">
              <div className="flex -space-x-1.5">
                {(m.method === 'boleto' ? ['Cielo'] : ACQUIRERS.slice(0, 3)).map(a => <AcqMark key={a} name={a} />)}
              </div>
              <button type="button" className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-fg text-ink transition-transform hover:scale-105" aria-label={`Ver vendas em ${METHOD_LABEL[m.method]}`}>
                <ArrowUpRight size={14} weight="bold" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const ROWS = todayTx.slice(0, 6)

export function TransactionsCard() {
  return (
    <section className="card @container overflow-hidden" aria-labelledby="tx-h">
      <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
        <h3 id="tx-h" className="text-[16px] font-medium">Últimas transações</h3>
        <button type="button" className="chip !h-9 text-[13px]">
          <span className="flex items-center gap-1 rounded-md bg-raised px-1.5 py-0.5 text-[11.5px]"><Rows size={12} /> 6</span>
          em lista <CaretDown size={12} />
        </button>
      </div>

      {/* Tabela quando cabe; lista empilhada quando o cartão estreita. */}
      <div className="hidden px-3 pb-3 @[560px]:block">
        <table className="w-full border-separate border-spacing-y-1 text-[13.5px]">
          <thead>
            <tr className="text-left text-[12.5px] text-fg-3">
              <th className="px-3 py-2 font-normal">Nº</th>
              <th className="px-3 py-2 font-normal">Cliente</th>
              <th className="hidden px-3 py-2 font-normal @[720px]:table-cell">Data</th>
              <th className="px-3 py-2 font-normal">Meio</th>
              <th className="px-3 py-2 font-normal">Status</th>
              <th className="px-3 py-2 text-right font-normal"><span className="inline-flex items-center gap-1">Valor <CaretUpDown size={12} /></span></th>
              <th className="px-3 py-2 text-right font-normal">Ação</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((t, k) => (
              <tr key={t.id} className="group">
                <td className="rounded-l-xl bg-sunk px-3 py-3 text-fg-3 transition-colors group-hover:bg-raised">#{k + 1}</td>
                <td className="bg-sunk px-3 py-3 transition-colors group-hover:bg-raised">
                  <span className="flex items-center gap-2.5"><Avatar name={t.customer} size={26} /><span className="truncate">{t.customer.split(' ')[0]} {t.customer.split(' ')[1][0]}.</span></span>
                </td>
                <td className="hidden bg-sunk px-3 py-3 tabular-nums text-fg-2 transition-colors group-hover:bg-raised @[720px]:table-cell">{dayMonth(t.at)} · {hour(t.at)}</td>
                <td className="bg-sunk px-3 py-3 text-fg-2 transition-colors group-hover:bg-raised">{METHOD_LABEL[t.method]}</td>
                <td className="bg-sunk px-3 py-3 transition-colors group-hover:bg-raised"><span className={`status ${t.status}`}>{STATUS_LABEL[t.status]}</span></td>
                <td className="bg-sunk px-3 py-3 text-right font-medium tabular-nums transition-colors group-hover:bg-raised">{money(t.amount)}</td>
                <td className="rounded-r-xl bg-sunk px-3 py-3 text-right transition-colors group-hover:bg-raised">
                  {t.status === 'chargeback' || t.status === 'declined'
                    ? <button type="button" className="btn-ghost">{t.status === 'chargeback' ? 'Contestar' : 'Detalhes'}</button>
                    : <button type="button" className="btn-white sm">Ver</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-1 px-3 pb-3 @[560px]:hidden">
        {ROWS.map(t => (
          <li key={t.id} className="flex items-center gap-3 rounded-xl bg-sunk px-3 py-3">
            <Avatar name={t.customer} size={34} />
            <div className="min-w-0">
              <p className="truncate text-[14px]">{t.customer}</p>
              <p className="text-[12.5px] text-fg-3">{METHOD_LABEL[t.method]} · {hour(t.at)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[14px] font-medium tabular-nums">{money(t.amount)}</p>
              <span className={`status ${t.status} mt-1 !h-5 !px-2 !text-[11px]`}>{STATUS_LABEL[t.status]}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
