/* Dados de demonstração. Semente fixa: a tela não muda a cada reload,
   senão a comparação entre as duas variações deixa de ser honesta. */

export type Method = 'pix' | 'card' | 'boleto'
export type Status = 'approved' | 'pending' | 'declined' | 'refunded' | 'chargeback'

export type Transaction = {
  id: string
  at: Date
  customer: string
  email: string
  method: Method
  acquirer: string
  status: Status
  amount: number
  fee: number
  net: number
  installments?: number
}

export type Authorization = { id: string; at: Date; amount: number; status: Status }

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20261016)
const pick = <T,>(arr: readonly T[], r = rnd()) => arr[Math.floor(r * arr.length)]

const FIRST = ['Ana', 'Bruno', 'Camila', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nathan', 'Olívia', 'Paulo', 'Rafaela', 'Samuel', 'Tatiane', 'Vinícius'] as const
const LAST = ['Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Haddad', 'Iglesias', 'Jardim', 'Lima', 'Moreira', 'Nogueira', 'Oliveira', 'Pacheco', 'Queiroz', 'Ribeiro', 'Santos', 'Teixeira', 'Vieira'] as const
export const ACQUIRERS = ['Stone', 'Cielo', 'Getnet', 'Adyen'] as const

/* Peso por desfecho, calibrado numa operação saudável de infoproduto. */
const STATUS_POOL: Status[] = [
  ...Array<Status>(71).fill('approved'),
  ...Array<Status>(18).fill('declined'),
  ...Array<Status>(7).fill('pending'),
  ...Array<Status>(3).fill('refunded'),
  ...Array<Status>(1).fill('chargeback'),
]
const METHOD_POOL: Method[] = [
  ...Array<Method>(68).fill('pix'),
  ...Array<Method>(26).fill('card'),
  ...Array<Method>(6).fill('boleto'),
]

/* Curva de uma operação brasileira: vale de madrugada, pico entre 20h e 22h. */
const HOUR_WEIGHT = [0.12, 0.07, 0.04, 0.03, 0.03, 0.05, 0.12, 0.28, 0.45, 0.62, 0.74, 0.8,
  0.72, 0.58, 0.64, 0.76, 0.85, 0.92, 0.88, 0.95, 1.0, 0.93, 0.66, 0.34]

const ticket = () => {
  const r = rnd()
  if (r > 0.97) return 1800 + rnd() * 3000   // cauda longa: o upsell caro
  if (r > 0.82) return 480 + rnd() * 900
  return 47 + rnd() * 320
}

const feeFor = (m: Method, v: number) => (m === 'pix' ? v * 0.0099 + 0.49 : m === 'card' ? v * 0.0399 + 0.59 : v * 0.0249 + 2.9)

export const NOW = new Date(2026, 9, 16, 21, 34, 0)

function makeTransaction(at: Date): Transaction {
  const method = pick(METHOD_POOL)
  const status = pick(STATUS_POOL)
  const amount = Math.round(ticket() * 100) / 100
  const charged = status === 'approved' || status === 'refunded' || status === 'chargeback'
  const fee = charged ? Math.round(feeFor(method, amount) * 100) / 100 : 0
  const first = pick(FIRST); const last = pick(LAST)
  return {
    id: 'tx_' + Math.floor(rnd() * 0xffffffff).toString(16).padStart(8, '0'),
    at,
    customer: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`.normalize('NFD').replace(/[̀-ͯ]/g, ''),
    method,
    acquirer: method === 'boleto' ? 'Cielo' : pick(ACQUIRERS),
    status,
    amount,
    fee,
    net: Math.round((amount - fee) * 100) / 100,
    installments: method === 'card' ? pick([1, 1, 1, 2, 3, 6, 12] as const) : undefined,
  }
}

/* 30 dias de transações, distribuídas pela curva horária. */
export const transactions: Transaction[] = (() => {
  const out: Transaction[] = []
  for (let d = 29; d >= 0; d--) {
    const dayBase = 88 + Math.floor(rnd() * 70) + (d === 0 ? 24 : 0)
    for (let i = 0; i < dayBase; i++) {
      const h = (() => { // sorteia hora respeitando o peso
        for (let tries = 0; tries < 24; tries++) {
          const cand = Math.floor(rnd() * 24)
          if (rnd() < HOUR_WEIGHT[cand]) return cand
        }
        return 20
      })()
      const at = new Date(NOW); at.setDate(NOW.getDate() - d)
      at.setHours(h, Math.floor(rnd() * 60), Math.floor(rnd() * 60), 0)
      if (at > NOW) continue
      out.push(makeTransaction(at))
    }
  }
  return out.sort((a, b) => b.at.getTime() - a.at.getTime())
})()

export const todayTx = transactions.filter(t => t.at.toDateString() === NOW.toDateString())
const approved = (list: Transaction[]) => list.filter(t => t.status === 'approved')

export const kpis = (() => {
  const a = approved(todayTx)
  const gross = a.reduce((s, t) => s + t.amount, 0)
  const net = a.reduce((s, t) => s + t.net, 0)
  const refunded = todayTx.filter(t => t.status === 'refunded').reduce((s, t) => s + t.amount, 0)
  return {
    gross, net,
    refundRate: gross ? (refunded / gross) * 100 : 0,
    avgTicket: a.length ? gross / a.length : 0,
    sales: a.length,
    attempts: todayTx.filter(t => t.status === 'approved' || t.status === 'declined' || t.status === 'pending').length,
    approvalRate: todayTx.length ? (a.length / todayTx.length) * 100 : 0,
    deltaVsYesterday: 8.2,
  }
})()

export const counts = {
  approved: todayTx.filter(t => t.status === 'approved').length,
  declined: todayTx.filter(t => t.status === 'declined').length,
  pending: todayTx.filter(t => t.status === 'pending').length,
}

/* Série do gráfico: faturamento aprovado por hora, dia ou mês. */
export type Point = { label: string; value: number }
export const seriesToday: Point[] = Array.from({ length: 24 }, (_, h) => ({
  label: `${String(h).padStart(2, '0')}:00`,
  value: approved(todayTx).filter(t => t.at.getHours() === h).reduce((s, t) => s + t.amount, 0),
}))
/* Barras pedem blocos, não 24 colunas finas: o dia vira 8 faixas de 3 horas. */
export const seriesTodayBlocks: Point[] = Array.from({ length: 8 }, (_, b) => {
  const from = b * 3
  return {
    label: `${String(from).padStart(2, '0')}h`,
    value: approved(todayTx).filter(t => t.at.getHours() >= from && t.at.getHours() < from + 3).reduce((s, t) => s + t.amount, 0),
  }
})

/* Faturamento de hoje ACUMULADO.
   ⚠️ Por bloco, o bloco corrente tem só os minutos já corridos (NOW é 21:34,
   então o bloco das 21h tem 34 min) e a curva despenca a pique no fim, o que
   não aconteceu na operação. Acumulado, a curva só sobe e fecha exatamente no
   número do título, que é a pergunta que a tela responde. */
export const seriesTodayAcc: Point[] = (() => {
  let acc = 0
  return seriesTodayBlocks.map(p => { acc += p.value; return { label: p.label, value: acc } })
})()

export const series7d: Point[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(NOW); d.setDate(NOW.getDate() - (6 - i))
  return {
    label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
    value: approved(transactions).filter(t => t.at.toDateString() === d.toDateString()).reduce((s, t) => s + t.amount, 0),
  }
})
export const series30d: Point[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(NOW); d.setDate(NOW.getDate() - (29 - i))
  return {
    label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
    value: approved(transactions).filter(t => t.at.toDateString() === d.toDateString()).reduce((s, t) => s + t.amount, 0),
  }
})

export const methodShare = (() => {
  const a = approved(todayTx)
  const total = a.reduce((s, t) => s + t.amount, 0) || 1
  const by = (m: Method) => a.filter(t => t.method === m)
  return (['pix', 'card', 'boleto'] as Method[]).map(m => ({
    method: m,
    sales: by(m).length,
    amount: by(m).reduce((s, t) => s + t.amount, 0),
    share: (by(m).reduce((s, t) => s + t.amount, 0) / total) * 100,
  }))
})()

export const acquirers = ACQUIRERS.map((name, i) => {
  const list = todayTx.filter(t => t.acquirer === name)
  const ok = list.filter(t => t.status === 'approved').length
  return {
    name,
    connected: i !== 3,
    approval: list.length ? (ok / list.length) * 100 : 0,
    share: todayTx.length ? (list.length / todayTx.length) * 100 : 0,
    mdr: [1.99, 2.39, 2.19, 2.79][i],
    spark: Array.from({ length: 16 }, () => 68 + rnd() * 26),
  }
})

export const settlement = [
  { label: 'D+0', date: 'hoje', amount: 18420.55, origin: 'Pix liquidado' },
  { label: 'D+1', date: '19/10', amount: 62140.8, origin: 'Pix de hoje' },
  { label: 'D+2', date: '20/10', amount: 31870.2, origin: 'Cartão à vista' },
  { label: 'D+7', date: '27/10', amount: 18960.9, origin: 'Boleto compensado' },
  { label: 'D+30', date: '16/11', amount: 51958.5, origin: 'Cartão parcelado' },
]

export const balance = { available: 18420.55, pending: 164930.4, reserve: 9850.0 }

/* A Fita: as últimas autorizações, a mais nova à direita. */
export const authorizations: Authorization[] = todayTx
  .slice(0, 80)
  .map(t => ({ id: t.id, at: t.at, amount: t.amount, status: t.status }))
  .reverse()

export const last7 = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(NOW); d.setDate(NOW.getDate() - (6 - i))
  return approved(transactions).filter(t => t.at.toDateString() === d.toDateString()).reduce((s, t) => s + t.amount, 0)
})

export const topSellers = [
  { name: 'Mentoria Alta Performance', sales: 184, amount: 238520 },
  { name: 'Curso Tráfego na Prática', sales: 612, amount: 149840 },
  { name: 'Pacote Criativos 2026', sales: 428, amount: 91100 },
  { name: 'Consultoria individual', sales: 37, amount: 58910 },
]

export const STATUS_LABEL: Record<Status, string> = {
  approved: 'Aprovada', pending: 'Pendente', declined: 'Recusada',
  refunded: 'Estornada', chargeback: 'Chargeback',
}
export const METHOD_LABEL: Record<Method, string> = { pix: 'Pix', card: 'Cartão', boleto: 'Boleto' }

export type Integration = { name: string; connected: boolean; sync: string | null }
export const integrations: Integration[] = [
  { name: 'Shopify', connected: true, sync: 'há 2 minutos' },
  { name: 'WooCommerce', connected: true, sync: 'há 14 minutos' },
  { name: 'Hotmart', connected: false, sync: null },
  { name: 'Webhook próprio', connected: true, sync: 'há 1 minuto' },
  { name: 'Zapier', connected: false, sync: null },
]

/* Últimos sete dias rotulados pelo dia da semana, para o dial e a linha de
   pontos. O dia vem de uma data construída em UTC com o deslocamento de
   Brasília aplicado à mão, senão o rótulo muda com o fuso de quem abre. */
const DIA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const byWeekday = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(NOW); d.setDate(NOW.getDate() - (6 - i))
  const list = approved(transactions).filter(t => t.at.toDateString() === d.toDateString())
  return {
    label: DIA[d.getDay()],
    value: list.length,
    amount: list.reduce((s, t) => s + t.amount, 0),
    ticket: list.length ? list.reduce((s, t) => s + t.amount, 0) / list.length : 0,
  }
})
