import { useState } from 'react'
import { DotsThreeVertical, ClockCounterClockwise, TrendUp, TrendDown, PlugsConnected } from '@phosphor-icons/react'
import { acquirers } from '../lib/data'
import { Delta, CardHead } from './ui'

export const ACQ_COLOR: Record<string, string> = { Stone: '#1fbf7a', Cielo: '#2aa7ea', Getnet: '#ef4a4f', Adyen: '#7c838d' }

export function AcqMark({ name, size = 26 }: { name: string; size?: number }) {
  const c = ACQ_COLOR[name] ?? '#7c838d'
  return (
    <span aria-hidden className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `linear-gradient(150deg, ${c}, color-mix(in srgb, ${c} 45%, #000))`, boxShadow: '0 0 0 2px var(--color-raised), inset 0 1px 0 rgb(255 255 255 / .25)' }}>
      {name[0]}
    </span>
  )
}

/* Variação fixa por adquirente: demonstração, não dado real. */
const DELTA: Record<string, number> = { Stone: 1.09, Cielo: -2.01, Getnet: 0.64, Adyen: 0 }

function Spark({ data: raw, color, w = 300, h = 96 }: { data: number[]; color: string; w?: number; h?: number }) {
  // média móvel de 3: o sorteio cru vira serrote, e aprovação real não oscila assim minuto a minuto
  const data = raw.map((v, i) => (v + (raw[i - 1] ?? v) + (raw[i + 1] ?? v)) / 3)
  const min = Math.min(...data) - 4, max = Math.max(...data) + 2
  const xy = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min)) * h] as const)
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  const mark = xy[xy.length - 4]
  const id = 'sp' + color.slice(1)
  return (
    <div className="relative h-24" aria-hidden>
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".22" /><stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L${w},${h}L0,${h}Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeOpacity=".75" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
    {/* marcador em HTML: no SVG esticado o círculo vira elipse */}
    <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white bg-sunk"
      style={{ left: `${(mark[0] / w) * 100}%`, top: `${(mark[1] / h) * 100}%` }} />
    </div>
  )
}

const FILTERS = ['Todas', 'Cartão', 'Pix'] as const

export default function Acquirers() {
  const [f, setF] = useState<(typeof FILTERS)[number]>('Todas')
  return (
    <section aria-labelledby="acq-h">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[13.5px] text-fg-2"><ClockCounterClockwise size={18} aria-hidden /> Atualiza a cada minuto</p>
          <h2 id="acq-h" className="mt-2 text-[24px] font-medium tracking-[-0.03em]">Aprovação por adquirente</h2>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Filtrar por meio">
          {FILTERS.map(x => (
            <button key={x} type="button" aria-pressed={f === x} onClick={() => setF(x)}
              className={`h-10 rounded-xl border px-4 text-[13.5px] transition-colors ${f === x ? 'border-[rgb(169_143_255/.3)] bg-[#221d3a] text-fg' : 'border-line bg-card text-fg-3 hover:text-fg'}`}>{x}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 wide:grid-cols-4">
        {acquirers.map(a => {
          const c = ACQ_COLOR[a.name]
          const d = DELTA[a.name]
          const [int, dec] = a.approval.toFixed(1).split('.')
          return (
            <article key={a.name} className="card relative overflow-hidden p-6">
              <div aria-hidden className="pointer-events-none absolute -left-10 top-16 h-40 w-40 rounded-full opacity-30 blur-2xl"
                style={{ background: a.connected ? c : 'transparent' }} />
              <div className="relative">
                <CardHead tile={<AcqMark name={a.name} size={24} />} label={a.name === 'Cielo' ? 'Cartão e boleto' : 'Cartão e Pix'} title={a.name}
                  right={<button type="button" className="icon-btn !h-10 !w-10 !rounded-xl" aria-label={`Opções de ${a.name}`}><DotsThreeVertical size={18} weight="bold" /></button>} />
              </div>

              {a.connected ? (
                <>
                  <p className="relative mt-6 flex items-center gap-2.5 text-[13px] text-fg-3">
                    <span className="h-5 w-[3px] rounded-full" style={{ background: c }} aria-hidden /> Aprovação hoje
                  </p>
                  <p className="relative mt-2 text-[40px] font-normal leading-none tracking-[-0.04em] tabular-nums">
                    {int}<span className="text-fg-3">,{dec}%</span>
                  </p>
                  <div className="relative mt-4 flex items-center gap-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-full ${d >= 0 ? 'bg-up-bg text-up' : 'bg-down-bg text-down'}`}>
                      {d >= 0 ? <TrendUp size={13} weight="bold" /> : <TrendDown size={13} weight="bold" />}
                    </span>
                    <Delta value={d} />
                    <span className="ml-auto whitespace-nowrap text-[12px] text-fg-3">{a.share.toFixed(0)}% do volume</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4"><Spark data={a.spark} color={c} /></div>
                </>
              ) : (
                <div className="relative mt-6 flex min-h-[208px] flex-col justify-between gap-6">
                  <div>
                    <p className="text-[15px] text-fg">Ainda não conectada</p>
                    <p className="mt-2 max-w-[30ch] text-[13px] leading-relaxed text-fg-3">Ligue a Adyen para dividir o volume de cartão e subir a aprovação em horário de pico.</p>
                  </div>
                  <button type="button" className="btn-ghost self-start !h-10 !px-4"><PlugsConnected size={16} aria-hidden /> Conectar</button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
