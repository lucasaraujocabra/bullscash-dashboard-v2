const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brlCompact = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })
const int = new Intl.NumberFormat('pt-BR')

export const money = (v: number) => brl.format(v)
export const moneyShort = (v: number) => brlCompact.format(v).replace(' ', ' ')
export const num = (v: number) => int.format(v)
export const pct = (v: number, digits = 1) => `${v.toFixed(digits).replace('.', ',')}%`
export const hour = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
export const dayMonth = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
export const dateTime = (d: Date) => `${dayMonth(d)} · ${hour(d)}`

export const plural = (n: number, one: string, many: string) => `${int.format(n)} ${n === 1 ? one : many}`

/* Em caixa estreita, valor completo quando cabe; compacto quando não cabe. */
export const fitMoney = (v: number, max = 13) => (brl.format(v).length <= max ? brl.format(v) : brlCompact.format(v).replace('\u00A0', ' '))
