import { useState, type CSSProperties } from 'react'
import Sidebar from './components/Sidebar'
import { Topbar, Ticker } from './components/Topbar'
import Kpis from './components/Kpis'
import RevenueCard from './components/RevenueCard'
import { BalanceCard, WithdrawCard } from './components/MoneyCards'
import { MethodsCard, TransactionsCard } from './components/Lists'
import Acquirers from './components/Acquirers'

const rise = (i: number) => ({ '--i': i }) as CSSProperties

/* Uma grade de 12 colunas e gap de 24 para a página inteira: toda borda de box cai
   em 3, 6 ou 9 colunas, a mesma linha das quatro adquirentes lá embaixo. */
export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [menu, setMenu] = useState(false)

  return (
    <div className="flex min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} mobileOpen={menu} onClose={() => setMenu(false)} />

      <div className="relative min-w-0 flex-1">
        {/* luz fria vindo de cima */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{ background: 'radial-gradient(60% 100% at 18% -30%, rgb(84 80 140 / .28), transparent 70%)' }} />

        <Topbar onMenu={() => setMenu(true)} />
        <Ticker />

        <main className="relative mx-auto max-w-[1680px] px-4 pb-16 pt-10 sm:px-6 xl:px-8">
          <div className="rise" style={rise(0)}>
            <p className="flex items-center gap-2 text-[13.5px] leading-5 text-fg-3"><span className="live-dot" aria-hidden /> Última atualização: <span className="text-fg">há 2 min</span></p>
            <h1 className="mt-4 text-[clamp(32px,3.4vw,48px)] font-medium leading-none tracking-[-0.04em]">Operação <span className="text-fg-2">ao vivo</span></h1>
          </div>

          <div className="rise mt-8" style={rise(1)}><Kpis /></div>

          <div className="mt-6 grid grid-cols-12 gap-6">
            <div className="rise col-span-12 wide:col-span-6" style={rise(2)}><RevenueCard /></div>
            <div className="rise col-span-12 wide:col-span-6" style={rise(3)}><BalanceCard /></div>

            {/* Abaixo de 1400 o saque e os meios dividem a linha e a tabela desce inteira. */}
            <div className="rise col-span-12 md:col-span-6 wide:col-span-3" style={rise(4)}><WithdrawCard /></div>
            <div className="rise order-last col-span-12 wide:order-none wide:col-span-6" style={rise(5)}><TransactionsCard /></div>
            <div className="rise col-span-12 md:col-span-6 wide:col-span-3" style={rise(6)}><MethodsCard /></div>
          </div>

          <div className="rise mt-16" style={rise(7)}><Acquirers /></div>
        </main>
      </div>
    </div>
  )
}
