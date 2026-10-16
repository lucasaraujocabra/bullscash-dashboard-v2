# BullsCash Painel 2.0 (projeto pessoal do Lucas)

**Não é projeto da Novo Dash.** Nada da metodologia de LP vale aqui (um botão só, kit `src/nd`,
booking, tracking, gate de domínio, org `Novo-Dash`, Vercel da agência). Falar em pt-BR.

- v1 (reprovada pelo cliente) mora em `~/Pessoal/dashboard-bullscash`. Esta é a v2, refeita do zero
  com o DNA de duas referências novas (painel "My Campaigns" e "Quantix"), medidas em
  `~/Pessoal/dashboard-bullscash/refs/v2-ref-*.colors.json`.
- Publicado no GitHub Pages pela branch `gh-pages`: `npm run deploy` (o token do gh não tem escopo `workflow`, então sem Actions).
  Repo público por decisão do Lucas (16/10/2026); dados são fictícios e a página é `noindex`.
- Commits como `Lucas Cabral <61991370+lucasaraujocabra@users.noreply.github.com>` (config local do repo).
- Cores e raios moram no `@theme` de `src/styles.css`. Classes próprias ficam em `@layer components`,
  senão vencem os utilitários do Tailwind (`hidden`, `md:flex`).
- Breakpoint próprio em `rem` (`--breakpoint-wide: 87.5rem`): em px o Tailwind ordena antes do `sm`.
- Zero travessão (—) em texto que renderiza.
