# Main Instructions: Arquitetura e Seguranca

Este arquivo consolida as melhores praticas de arquitetura e seguranca adotadas no projeto ate o momento.

## 1) Principios Arquiteturais

- Separacao por dominio: cada modulo funcional fica em `src/modules/<dominio>`.
- Separacao por responsabilidade:
  - `components/`: UI e interacao local.
  - `hooks/`: regras de orquestracao de estado/fluxo.
  - `services/`: chamadas HTTP e IO externo.
  - `types.ts`: contratos do dominio.
  - `pages/`: composicao de tela.
- Camadas globais bem definidas:
  - `src/app`: roteamento, providers e componentes de infraestrutura da app.
  - `src/infrastructure`: cliente HTTP e integracoes base.
  - `src/shared`: utilitarios e componentes reutilizaveis.

## 2) Padrao de Fluxo de Dados

- API centralizada em `api_client` (`src/infrastructure/api/api-client.ts`).
- Services por dominio usam `api_client` e expõem metodos semanticos.
- Hooks de dominio encapsulam React Query (`useQuery`, `useMutation`) e retornam API amigavel para componentes.
- Componentes recebem props tipadas e evitam chamar API diretamente.
- Paginas orquestram hooks e repassam estado para componentes filhos.

## 3) Convencoes de Codigo

- TypeScript em modo estrito (tipagem explicita em fronteiras de dados).
- Naming consistente em `snake_case` para variaveis locais no estilo atual do projeto.
- Evitar logica de negocio dentro de componentes puramente visuais.
- Evitar duplicacao: extrair para hook/utilitario quando a regra aparece em mais de um ponto.
- Comentarios apenas quando realmente agregam contexto (nao comentar o obvio).

## 4) Estado e Cache (React Query)

- Chaves de cache previsiveis por recurso e parametro, por exemplo:
  - `['games']`
  - `['configs', game]`
  - `['game-config-fields', game]`
- `enabled` em queries dependentes de parametros obrigatorios.
- Invalidacao explicita apos mutacoes que alteram colecoes relacionadas.
- Evitar `retry` agressivo para endpoints que retornam validacao funcional.

## 5) Regras de Seguranca Ja Utilizadas

### 5.1 Cliente HTTP e Ambiente

- `baseURL` via `VITE_API_URL` com fallback local controlado.
- Timeout definido para evitar requests pendentes indefinidamente.
- Interceptor injeta `Authorization` quando token existe.
- Em `401`, token e removido para reduzir sessao invalida persistente.
- Em producao, mensagens de erro sao genericamente encapsuladas para evitar vazamento de detalhes.

### 5.2 Autenticacao

- Token guardado com chave unica (`auth_token`).
- Validacao de expiracao de token em bootstrap de autenticacao.
- Decodificacao defensiva de JWT:
  - valida formato em 3 partes
  - trata excecoes de parse
  - valida campos minimos obrigatorios
- `ProtectedRoute` bloqueia telas protegidas e redireciona para `/` quando nao autenticado.

### 5.3 Validacao e Higienizacao

- Utilitarios centralizados em `src/shared/utils/validation.ts`.
- Sanitizacao basica de strings antes de uso sensivel (`sanitizeString`).
- Validacoes explicitas por tipo (`email`, `number`, `text`).
- Validacao de codigo de sessao com regex restritiva.

### 5.4 UI Dinamica e Hardening

- Renderer dinamico de campos usa allowlist de tipos suportados:
  - `string`, `number`, `boolean`, `enum(...)`.
- Tipos desconhecidos sao descartados com fallback seguro (sem quebrar tela).
- Valores vindos do backend sao exibidos como texto, sem interpretacao de HTML/script.
- Campos internos de controle (como `game`) nao devem ser expostos para edicao quando definidos externamente pela pagina.

## 6) Boas Praticas Para Novas Features

- Defina contrato em `types.ts` antes de implementar tela.
- Crie metodos no service antes de montar hooks/componentes.
- Encapsule detalhes de erro/loading no hook sempre que possivel.
- Em UI, sempre tratar estados:
  - carregando
  - erro
  - vazio
  - sucesso
- Evite hardcode de regras por jogo quando backend fornece schema.

## 7) Checklist de PR (Arquitetura + Seguranca)

Antes de abrir PR, validar:

- Estrutura por modulo respeitada (`components/hooks/services/types/pages`).
- Sem chamada HTTP direta em componente de UI.
- Sem `any` desnecessario nas fronteiras de dados.
- Estado remoto com React Query e chaves coerentes.
- Tratamento de loading/erro em todos endpoints novos.
- Sem render de conteudo HTML remoto.
- Campos dinamicos com allowlist + fallback seguro.
- Sem logs com token, credenciais ou payload sensivel.
- Build e lint passando (`npm run build`, `npm run lint`).

## 8) Limites e Melhorias Futuras

- Evoluir `validateSecureApi` para enforce em producao (ex: bloquear HTTP fora de localhost).
- Migrar para estrategia de token mais segura quando backend suportar cookies httpOnly + CSRF.
- Ampliar validacoes de input conforme contratos de backend evoluirem.
- Incluir testes automatizados para fluxos criticos de autenticacao e configuracao dinamica.
