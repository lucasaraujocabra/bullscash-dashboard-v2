import {
  SquaresFour, ArrowsLeftRight, Bank, Wallet, Trophy, Gift, PlugsConnected,
  Headset, UserCircle, SignOut, CaretLeft, X,
} from '@phosphor-icons/react'

/* "Produtos" saiu do menu a pedido do gestor. */
const GROUPS = [
  { group: 'Operação', items: [
    { label: 'Início', icon: SquaresFour, current: true },
    { label: 'Transações', icon: ArrowsLeftRight, badge: '3' },
    { label: 'Adquirentes', icon: Bank },
  ] },
  { group: 'Dinheiro', items: [{ label: 'Financeiro', icon: Wallet }] },
  { group: 'Crescimento', items: [
    { label: 'Top Sellers', icon: Trophy },
    { label: 'Indique e Ganhe', icon: Gift, tag: 'Novo' },
  ] },
  { group: 'Sistema', items: [{ label: 'Integrações', icon: PlugsConnected }] },
]
const FOOT = [
  { label: 'Suporte', icon: Headset, badge: '2' },
  { label: 'Minha conta', icon: UserCircle },
  { label: 'Sair', icon: SignOut },
]

type Item = { label: string; icon: typeof SquaresFour; current?: boolean; badge?: string; tag?: string }

function NavLink({ item, collapsed }: { item: Item; collapsed: boolean }) {
  const Icon = item.icon
  return (
    <a
      href="#"
      onClick={e => e.preventDefault()}
      aria-current={item.current ? 'page' : undefined}
      className={`nav-item ${collapsed ? 'justify-center !px-0' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={22} weight="light" aria-hidden className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-md border border-line-2 bg-raised px-1.5 text-[12px] text-fg">{item.badge}</span>
      )}
      {!collapsed && item.tag && (
        <span className="rounded-md bg-brand/20 px-2 py-0.5 text-[12px] font-medium text-brand-data">{item.tag}</span>
      )}
      {collapsed && item.badge && <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand-fg" />}
    </a>
  )
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: {
  collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onClose: () => void
}) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        aria-label="Navegação principal"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-line bg-rail transition-[width,transform] duration-500 ease-[var(--ease-out)]
          ${collapsed ? 'lg:w-[88px]' : 'lg:w-[272px]'} w-[288px]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0`}
      >
        {/* luz de cima, como na ref 2 */}
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full opacity-70"
          style={{ background: 'radial-gradient(closest-side, rgb(90 86 140 / .38), transparent)' }} />

        <div className={`relative flex items-center gap-3 px-6 pb-6 pt-7 ${collapsed ? 'lg:flex-col lg:px-0' : ''}`}>
          <img src="logo-bulls.webp" alt="Bulls" width={74} height={34} className={`h-[30px] w-auto ${collapsed ? 'lg:hidden' : ''}`} />
          {collapsed && <span className="hidden h-9 w-9 overflow-hidden lg:block"><img src="logo-bulls.webp" alt="Bulls" className="h-9 max-w-none" style={{ width: 'auto' }} /></span>}
          <button type="button" onClick={onToggle} className="icon-btn !h-10 !w-10 !rounded-xl ml-auto hidden lg:inline-grid" aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
            <CaretLeft size={16} className={`transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button type="button" onClick={onClose} className="icon-btn !h-10 !w-10 !rounded-xl ml-auto lg:hidden" aria-label="Fechar menu">
            <X size={16} />
          </button>
        </div>

        {!collapsed && (
          <div className="relative mx-6 border-y border-line py-6">
            <p className="text-[28px] font-medium leading-[1.08] tracking-[-0.035em]">Boa noite,<br />Lucas</p>
            <p className="mt-2.5 text-[13.5px] text-fg-3">Último acesso: 16 out 2026, 08:12</p>
          </div>
        )}

        <nav className={`relative flex-1 overflow-y-auto no-scrollbar pb-4 pt-5 ${collapsed ? 'px-4' : 'px-4'}`}>
          {GROUPS.map(g => (
            <div key={g.group} className="mb-3">
              {!collapsed
                ? <p className="mb-1.5 px-3.5 text-[13px] text-fg-3">{g.group}</p>
                : <div className="mx-auto mb-2 mt-1 h-px w-6 bg-line" />}
              <div className="flex flex-col gap-0.5">
                {g.items.map(i => <NavLink key={i.label} item={i} collapsed={collapsed} />)}
              </div>
            </div>
          ))}
        </nav>

        <div className="relative border-t border-line px-4 py-4">
          {FOOT.map(i => <NavLink key={i.label} item={i} collapsed={collapsed} />)}
        </div>
      </aside>
    </>
  )
}
