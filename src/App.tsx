import { useState, type CSSProperties } from 'react'
import Sidebar from './components/Sidebar'
import { Topbar, Ticker } from './components/Topbar'
import RevenueCard from './components/RevenueCard'
import { BalanceCard, WithdrawCard } from './components/MoneyCards'
import { MethodsCard, TransactionsCard } from './components/Lists'
import Acquirers from './components/Acquirers'
import { Money } from './components/ui'
import { kpis } from './lib/data'
import { pct } from './lib/format'

const rise = (i: number) => ({ '--i': i }) as CSSProperties

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [menu, setMenu] = useState(false)

  return (
    <div className="flex min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} mobileOpen={menu} onClose={() => setMenu(false)} />

      <div className="relative min-w-0 flex-1">
        {/* luz fria vindo de cima (ref 2) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{ background: 'radial-gradient(60% 100% at 18% -30%, rgb(84 80 140 / .28), transparent 70%)' }} />

        <Topbar onMenu={() => setMenu(true)} />
        <Ticker />

        <main className="relative mx-auto max-w-[1680px] px-4 pb-16 pt-8 sm:px-6 xl:px-8 xl:pt-10">
          <div className="rise flex flex-wrap items-end justify-between gap-x-10 gap-y-6" style={rise(0)}>
            <div>
              <p className="flex items-center gap-2.5 text-[13.5px] text-fg-3"><span className="live-dot" aria-hidden /> Última atualização: <span className="text-fg">há 2 min</span></p>
              <h1 className="mt-3 text-[clamp(34px,3.6vw,48px)] font-medium leading-[1.02] tracking-[-0.04em]">Operação<br className="hidden sm:block" /> <span className="text-fg-2">ao vivo</span></h1>
            </div>
            <dl className="grid w-full grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-card/60 sm:w-auto">
              <div className="px-4 py-3 sm:px-6"><dt className="text-[12.5px] text-fg-3">Faturamento hoje</dt><dd className="mt-1"><Money value={kpis.gross} cents={false} className="text-[clamp(17px,1.6vw,22px)] font-medium" /></dd></div>
              <div className="px-4 py-3 sm:px-6"><dt className="text-[12.5px] text-fg-3">Vendas</dt><dd className="mt-1 text-[clamp(17px,1.6vw,22px)] font-medium tabular-nums tracking-[-0.03em]">{kpis.sales}<span className="text-fg-3"> de {kpis.attempts}</span></dd></div>
              <div className="px-4 py-3 sm:px-6"><dt className="text-[12.5px] text-fg-3">Aprovação</dt><dd className="mt-1 text-[clamp(17px,1.6vw,22px)] font-medium tabular-nums tracking-[-0.03em]">{pct(kpis.approvalRate)}</dd></div>
            </dl>
          </div>

          {/* Duas regiões separadas por um fio, como a ref 1. */}
          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-0">
            <div className="flex min-w-0 flex-col gap-6 xl:border-r xl:border-line xl:pr-8">
              <div className="rise" style={rise(1)}><RevenueCard /></div>
              <div className="rise" style={rise(3)}><MethodsCard /></div>
            </div>
            <div className="flex min-w-0 flex-col gap-6 xl:pl-8">
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:grid-cols-1 wide:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <div className="rise flex" style={rise(2)}><div className="flex flex-1 flex-col"><BalanceCard /></div></div>
                <div className="rise flex flex-col" style={rise(2)}><WithdrawCard /></div>
              </div>
              <div className="rise" style={rise(4)}><TransactionsCard /></div>
            </div>
          </div>

          <div className="rise mt-12 border-t border-line pt-10" style={rise(5)}><Acquirers /></div>
        </main>
      </div>
    </div>
  )
}
