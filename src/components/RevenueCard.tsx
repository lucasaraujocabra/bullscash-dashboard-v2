import { useMemo, useState } from 'react'
import { ChartLineUp } from '@phosphor-icons/react'
import { todayTx, series7d, series30d, kpis } from '../lib/data'
import { money } from '../lib/format'
import { Money, Delta, Segmented, CardHead, useSize } from './ui'

type Period = 'hoje' | '7d' | '30d'
type Pt = { label: string; tip: string; value: number }

/* Hoje é acumulado por hora: a curva fecha exatamente no total do rodapé. */
const hourly: Pt[] = (() => {
  let acc = 0
  return Array.from({ length: 22 }, (_, h) => {
    acc += todayTx.filter(t => t.status === 'approved' && t.at.getHours() === h).reduce((s, t) => s + t.amount, 0)
    return { label: `${String(h).padStart(2, '0')}h`, tip: `Hoje, ${String(h).padStart(2, '0')}:59`, value: acc }
  })
})()
const daily = (s: { label: string; value: number }[]): Pt[] => s.map(p => ({ ...p, tip: p.label }))

const DATA: Record<Period, { pts: Pt[]; total: number; delta: number; vs: string }> = {
  hoje: { pts: hourly, total: kpis.gross, delta: kpis.deltaVsYesterday, vs: 'vs. ontem no mesmo horário' },
  '7d': { pts: daily(series7d), total: series7d.reduce((s, p) => s + p.value, 0), delta: 12.83, vs: 'vs. 7 dias anteriores' },
  '30d': { pts: daily(series30d), total: series30d.reduce((s, p) => s + p.value, 0), delta: 19.23, vs: 'vs. 30 dias anteriores' },
}

const bestHour = (() => {
  const by = Array.from({ length: 24 }, (_, h) => todayTx.filter(t => t.status === 'approved' && t.at.getHours() === h).reduce((s, t) => s + t.amount, 0))
  const h = by.indexOf(Math.max(...by))
  return `${String(h).padStart(2, '0')}h às ${String(h + 1).padStart(2, '0')}h`
})()


export default function RevenueCard() {
  const [period, setPeriod] = useState<Period>('hoje')
  const { pts, total, delta, vs } = DATA[period]
  const [active, setActive] = useState<number | null>(null)
  const [ref, { w: W, h: mh }] = useSize<HTMLDivElement>()
  const H = Math.max(mh, 192)
  const G = 44 // calha dos rótulos do eixo Y

  const geo = useMemo(() => {
    const top = Math.max(...pts.map(p => p.value)) || 1
    // passo redondo (1, 2, 2,5 ou 5 × 10ⁿ) para o eixo ler "10 mil, 20 mil", nunca "13.427"
    const raw = top / 4, pow = 10 ** Math.floor(Math.log10(raw)), m = raw / pow
    const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * pow
    const max = Math.ceil(top / step) * step
    const y = (v: number) => 8 + (1 - v / max) * (H - 16)
    const PW = W - G
    const xy = pts.map((p, i) => [G + (i / (pts.length - 1)) * PW, y(p.value)] as const)
    const line = xy.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join('')
    const rows = Array.from({ length: Math.round(max / step) + 1 }, (_, k) => ({ v: k * step, y: y(k * step) }))
    const cols = Array.from({ length: 7 }, (_, k) => G + (k / 6) * PW)
    return { xy, line, area: `${line}L${W},${y(0)}L${G},${y(0)}Z`, rows, cols, y0: y(0), yTop: y(max) }
  }, [pts, W, H])

  /* Sem hover, o marcador fica no pico, como na referência. */
  const peak = pts.reduce((b, p, i) => (p.value - (pts[i - 1]?.value ?? 0) > pts[b].value - (pts[b - 1]?.value ?? 0) ? i : b), 1)
  const idx = Math.min(active ?? peak, pts.length - 1)
  const [px, py] = geo.xy[idx] ?? [0, 0]
  const prev = pts[idx - 1]?.value
  const change = prev ? ((pts[idx].value - prev) / prev) * 100 : 0
  const ticks = [0, 1, 2, 3].map(k => Math.round((k / 3) * (pts.length - 1)))

  const onMove = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    setActive(Math.min(pts.length - 1, Math.max(0, Math.round(((e.clientX - r.left - G) / (r.width - G)) * (pts.length - 1)))))
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setActive(Math.max(0, idx - 1))
    if (e.key === 'ArrowRight') setActive(Math.min(pts.length - 1, idx + 1))
  }

  return (
    <section aria-labelledby="fat-h" className="card card-tint flex h-full flex-col overflow-hidden p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-[200px] flex-1"><CardHead tile={<ChartLineUp size={20} weight="light" />} label="Vendas aprovadas" title="Faturamento" id="fat-h" /></div>
        <Segmented label="Período" value={period} onChange={p => { setPeriod(p); setActive(null) }}
          options={[{ value: 'hoje', label: 'Hoje' }, { value: '7d', label: '7 dias' }, { value: '30d', label: '30 dias' }]} />
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <Money value={total} className="text-[clamp(32px,3vw,40px)] font-light leading-none" />
          <p className="mt-2 flex items-center gap-2 text-[13px] text-fg-3"><Delta value={delta} /> {vs}</p>
        </div>
        <dl className="text-[13px] leading-5 sm:text-right">
          <dt className="text-fg-3">Melhor hora de hoje</dt><dd className="text-fg">{bestHour}</dd>
        </dl>
      </div>

      <div ref={ref} className="relative mt-6 min-h-[192px] flex-1">
        {W > 0 && (
          <svg
            width="100%" height={H} className="absolute inset-0 block cursor-crosshair touch-pan-y outline-none"
            role="img" tabIndex={0}
            aria-label={`Faturamento ${period === 'hoje' ? 'acumulado de hoje' : 'por dia'}. Use as setas para navegar. ${pts[idx].tip}: ${money(pts[idx].value)}`}
            onPointerMove={onMove} onPointerLeave={() => setActive(null)} onKeyDown={onKey}
          >
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8c66ff" stopOpacity=".28" />
                <stop offset="1" stopColor="#8c66ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g stroke="rgb(255 255 255 / .07)" shapeRendering="crispEdges">
              {geo.rows.map(r => <line key={r.v} x1={G} x2={W} y1={r.y} y2={r.y} />)}
              {geo.cols.map(x => <line key={x} x1={x} x2={x} y1={geo.yTop} y2={geo.y0} strokeOpacity=".7" />)}
            </g>
            <path d={geo.area} fill="url(#fill)" />
            <path key={period} d={geo.line} pathLength={1} className="draw" fill="none" stroke="#a98fff" strokeWidth="1.75" strokeLinejoin="round" />
            <line x1={px} x2={px} y1={py} y2={H} stroke="rgb(255 255 255 / .35)" strokeDasharray="3 4" />
            <circle cx={px} cy={py} r="9" fill="rgb(169 143 255 / .18)" />
            <circle cx={px} cy={py} r="4.5" fill="#fff" stroke="#a98fff" strokeWidth="2" />
          </svg>
        )}
        {W > 0 && geo.rows.map(r => (
          <span key={r.v} aria-hidden className="pointer-events-none absolute left-0 -translate-y-1/2 text-[11px] leading-none tabular-nums text-fg-3" style={{ top: r.y }}>
            {r.v === 0 ? '0' : `${(r.v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`}
          </span>
        ))}
        {W > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute w-[152px] rounded-2xl border border-white/10 bg-[#1b1a26]/80 p-3 backdrop-blur-md transition-[left,top] duration-200 ease-out"
            style={{ left: px + 168 < W ? px + 16 : px - 168, top: Math.min(Math.max(py + 16, 0), H - 88) }}
          >
            <p className="text-[12.5px] text-fg-2">{pts[idx].tip}</p>
            <p className="mt-1 text-[15px] font-medium tabular-nums">{money(pts[idx].value)}</p>
            <p className={`mt-1 text-[12px] ${change >= 0 ? 'text-up' : 'text-down'}`}>{change >= 0 ? '+' : '-'}{Math.abs(change).toFixed(2).replace('.', ',')}%</p>
          </div>
        )}
      </div>
      {/* rótulos do eixo X na mesma coluna das linhas verticais */}
      <div className="relative mt-3 h-4 text-[12.5px] leading-4 text-fg-3" aria-hidden>
        {ticks.map((t, k) => (
          <span key={t} className="absolute top-0" style={{ left: G + (k / 3) * (W - G), transform: `translateX(${k === 0 ? 0 : k === 3 ? -100 : -50}%)` }}>{pts[t].label}</span>
        ))}
      </div>
    </section>
  )
}
