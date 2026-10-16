import { House, MagnifyingGlass, Bell, CaretLeft, CaretRight, CaretDown, List, PixLogo, CreditCard, Barcode } from '@phosphor-icons/react'
import { todayTx, METHOD_LABEL, STATUS_LABEL, type Method } from '../lib/data'
import { money, hour } from '../lib/format'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex h-[76px] items-center gap-3 border-b border-line px-4 sm:px-6 xl:px-8">
      <button type="button" onClick={onMenu} className="icon-btn !h-10 !w-10 !rounded-xl lg:hidden" aria-label="Abrir menu"><List size={18} /></button>
      <nav aria-label="Você está em" className="flex min-w-0 items-center gap-3 text-[17px]">
        <House size={26} weight="light" className="hidden shrink-0 text-fg-2 sm:block" aria-hidden />
        <span className="hidden text-fg-3 sm:inline">Visão geral</span>
        <span className="hidden text-fg-3 sm:inline" aria-hidden>/</span>
        <span className="truncate text-fg">Início</span>
      </nav>

      <div className="ml-auto flex items-center gap-2.5">
        <label className="chip hidden w-[260px] cursor-text md:flex 2xl:w-[320px]">
          <MagnifyingGlass size={16} aria-hidden />
          <input placeholder="Buscar transação ou cliente" className="min-w-0 flex-1 bg-transparent text-[13.5px] text-fg outline-none placeholder:text-fg-3" />
          <kbd className="rounded-md border border-line bg-raised px-1.5 py-0.5 font-sans text-[11px] text-fg-3">⌘K</kbd>
        </label>
        <button type="button" className="chip !px-3" aria-label="2 avisos novos">
          <Bell size={17} />
          <span className="hidden rounded-full bg-raised px-2 py-0.5 text-[12px] text-fg sm:inline">2 novos</span>
        </button>
        <div className="chip hidden !gap-1 !px-1.5 xl:flex">
          <button type="button" className="icon-btn round !h-7 !w-7 !border-0 !bg-transparent" aria-label="Dia anterior"><CaretLeft size={14} /></button>
          <span className="px-1 text-[13.5px] text-fg">Hoje, 16 out</span>
          <button type="button" className="icon-btn round !h-7 !w-7 !border-0 !bg-transparent" aria-label="Próximo dia" disabled><CaretRight size={14} /></button>
        </div>
        <button type="button" className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/[.04]" aria-label="Conta de Lucas Cabral">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/.25)]">LC</span>
          <span className="hidden text-left leading-tight 2xl:block">
            <span className="flex items-center gap-1.5 text-[14px] font-medium">Lucas Cabral <CaretDown size={12} className="text-fg-3" /></span>
            <span className="text-[12.5px] text-fg-3">@operacao.loja</span>
          </span>
        </button>
      </div>
    </header>
  )
}

const METHOD_ICON: Record<Method, typeof PixLogo> = { pix: PixLogo, card: CreditCard, boleto: Barcode }

/* Fita: as últimas autorizações correndo, no lugar do banner que o gestor tirou. */
export function Ticker() {
  const items = todayTx.slice(0, 22)
  const row = (dup: boolean) => items.map(t => {
    const Icon = METHOD_ICON[t.method]
    const tone = t.status === 'approved' ? 'text-up' : t.status === 'pending' ? 'text-wait' : t.status === 'refunded' ? 'text-fg-3' : 'text-down'
    return (
      <li key={(dup ? 'b' : 'a') + t.id} className="flex items-center gap-3 border-r border-line px-6 text-[14px]" aria-hidden={dup || undefined}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-raised text-fg-2"><Icon size={13} weight="bold" /></span>
        <span className="text-fg">{METHOD_LABEL[t.method]}</span>
        <span className="text-fg-3">{hour(t.at)}</span>
        <span className="font-medium tabular-nums text-fg">{money(t.amount)}</span>
        <span className={`text-[12.5px] ${tone}`}>{STATUS_LABEL[t.status]}</span>
      </li>
    )
  })
  return (
    <div className="tape relative overflow-hidden border-b border-line" aria-label="Últimas autorizações">
      <ul className="tape-track h-[52px] items-center">{row(false)}{row(true)}</ul>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent" />
    </div>
  )
}
