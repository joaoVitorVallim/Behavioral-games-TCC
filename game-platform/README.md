# BehaviorLab — game-platform

Frontend da BehaviorLab, plataforma de análise comportamental desenvolvida em
parceria com a FHO. Docentes criam sessões de coleta de dados baseadas em
jogos interativos (dilema do prisioneiro, roleta); alunos participam das
sessões e os resultados alimentam relatórios para estudo.

## Stack

- React 19 + TypeScript, build com Vite
- Roteamento: React Router
- Estado remoto/cache: TanStack React Query
- HTTP client: Axios
- Estilização: Tailwind CSS
- Jogos: Phaser (dilema do prisioneiro) + GSAP (transições), Socket.IO
  (partidas em tempo real)
- Gráficos: Recharts
- Ícones: lucide-react

## Rodando localmente

```bash
npm install
npm run dev       # ambiente de desenvolvimento (Vite)
```

Configure a URL da API do backend em `.env` (veja `VITE_API_URL`; padrão
`http://localhost:3000`).

Outros scripts:

```bash
npm run build      # typecheck (tsc -b) + build de produção (vite build)
npm run lint       # ESLint
npm run preview    # serve o build de produção localmente
```

## Estrutura

```text
src/
  app/            # bootstrap, rotas, providers globais, ProtectedRoute, NotFoundPage
  infrastructure/ # cliente HTTP e integrações base
  modules/        # um diretório por domínio: auth, game-session, prisoner, reports, roulette
  shared/         # hooks, componentes e utilitários reutilizáveis entre domínios
```

Cada módulo de domínio segue o padrão `components/ hooks/ services/ types.ts
pages/` — ver `main instructions.md` para a convenção completa de arquitetura
e segurança adotada no projeto.

## Documentação

- [`documentation.md`](./documentation.md) — arquitetura, fluxo de dados, rotas, endpoints
- [`DESIGN_RULES.md`](./DESIGN_RULES.md) — convenções visuais (cores, componentes, nomenclatura)
- [`main instructions.md`](./main%20instructions.md) — arquitetura e segurança
