# Instructions for GitHub Copilot

## Stack do Projeto

- **TypeScript** com **React**
- **Tailwind CSS** para estilização
- **Vite** como bundler
- **React Router** para rotas
- **React Query** para gerenciamento de estado assíncrono

---

## Convenções de Nomenclatura

### Obrigatório seguir:

- **Métodos e funções**: `camelCase`
- **Variáveis**: `snake_case`
- **Componentes React**: `PascalCase`
- **Tipos e Interfaces**: `PascalCase`
- **Nunca iniciar variáveis/funções com letra maiúscula** (exceto componentes e types)

```typescript
// ✅ Correto
const user_name = "João"
const handleClick = () => {}
const UserProfile = () => {}
interface UserData {}

// ❌ Evitar
const UserName = "João"
const HandleClick = () => {}
```

---

## Princípios

1. **Código simples e direto** - evite over-engineering
2. **Sempre use Tailwind CSS** - sem CSS inline ou arquivos separados
3. **TypeScript strict** - evite `any`, sempre defina tipos
4. **Componentes pequenos e focados**

---

## Design e Interface (UI/UX)

### Princípios de Design

Quando uma **imagem de referência** for fornecida:

1. **Analise cuidadosamente a imagem** antes de começar a codar
2. **Replique o layout exato**: posicionamento, espaçamento, proporções
3. **Mantenha a hierarquia visual**: tamanhos de fonte, pesos, cores
4. **Respeite o estilo**: arredondamento, sombras, bordas, ícones
5. **Use as cores exatas** ou muito próximas da referência

### Checklist ao Receber Imagem de Referência

- [ ] Identificar paleta de cores (backgrounds, textos, botões)
- [ ] Observar tamanhos e espaçamentos (padding, margin, gap)
- [ ] Notar tipografia (tamanhos, weights, line-heights)
- [ ] Verificar bordas e sombras (rounded, shadow)
- [ ] Analisar layout (flex, grid, positioning)
- [ ] Identificar estados (hover, active, disabled)

### Componentes Comuns

#### Cartões/Cards
```typescript
// Exemplo baseado em design moderno
<div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
      {/* ícone */}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Título</h3>
      <p className="text-sm text-gray-500">Subtítulo</p>
    </div>
  </div>
</div>
```

#### Botões com Estilo
```typescript
// Primário
<button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg">
  Ação Principal
</button>

// Secundário
<button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
  Ação Secundária
</button>

// Outline
<button className="border-2 border-blue-500 text-blue-500 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
  Outline
</button>
```

#### Inputs Modernos
```typescript
<div className="relative">
  <input
    type="text"
    placeholder="Digite aqui..."
    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
  />
  {/* Ícone opcional */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
    {/* ícone */}
  </div>
</div>
```

### Paletas de Cores Comuns

```typescript
// Gaming/Modern
const colors = {
  primary: 'bg-purple-600',
  secondary: 'bg-pink-500',
  accent: 'bg-cyan-400',
  dark: 'bg-gray-900',
  darker: 'bg-gray-950'
}

// Professional/Clean
const colors = {
  primary: 'bg-blue-600',
  secondary: 'bg-slate-700',
  accent: 'bg-emerald-500',
  light: 'bg-gray-50',
  white: 'bg-white'
}

// Warm/Friendly
const colors = {
  primary: 'bg-orange-500',
  secondary: 'bg-amber-600',
  accent: 'bg-yellow-400',
  neutral: 'bg-stone-100'
}
```

### Layout Patterns

#### Grid de Cards
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

#### Sidebar + Content
```typescript
<div className="flex min-h-screen">
  {/* Sidebar */}
  <aside className="w-64 bg-gray-900 text-white p-6">
    {/* nav */}
  </aside>
  
  {/* Main Content */}
  <main className="flex-1 bg-gray-50 p-8">
    {/* content */}
  </main>
</div>
```

#### Header + Content + Footer
```typescript
<div className="min-h-screen flex flex-col">
  <header className="bg-white shadow-sm px-6 py-4">
    {/* header */}
  </header>
  
  <main className="flex-1 bg-gray-50 p-8">
    {/* content */}
  </main>
  
  <footer className="bg-gray-900 text-white px-6 py-8">
    {/* footer */}
  </footer>
</div>
```

### Responsividade

Sempre considere mobile-first:

```typescript
// Mobile primeiro, depois desktop
<div className="
  p-4 
  md:p-6 
  lg:p-8
  
  text-sm 
  md:text-base 
  lg:text-lg
  
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3
">
  {/* content */}
</div>
```

### Estados Visuais

Sempre adicione feedback visual:

```typescript
// Hover, Focus, Active, Disabled
<button className="
  bg-blue-500 
  hover:bg-blue-600 
  active:bg-blue-700 
  focus:ring-2 
  focus:ring-blue-300
  disabled:bg-gray-300 
  disabled:cursor-not-allowed
  transition-all
">
  Botão
</button>
```

### Animações e Transições

Use transições suaves:

```typescript
// Transições básicas
className="transition-all duration-200 ease-in-out"

// Hover effects
className="transform hover:scale-105 transition-transform"

// Fade in
className="opacity-0 animate-fade-in"

// Slide in
className="translate-x-full animate-slide-in"
```

### Ícones e Imagens

Para ícones, use bibliotecas como:
- Lucide React: `import { Icon } from 'lucide-react'`
- Hero Icons: `import { IconName } from '@heroicons/react/24/outline'`

```typescript
import { Home, User, Settings } from 'lucide-react'

<Home className="w-5 h-5 text-gray-600" />
```

### Importante: Matching de Referência

Quando receber uma imagem de referência:

1. **Extraia os valores exatos**:
   - Backgrounds: ex: `bg-slate-900` se for dark
   - Textos: ex: `text-white`, `text-gray-400`
   - Tamanhos: ex: `text-2xl`, `text-sm`
   - Espaçamentos: ex: `p-6`, `gap-4`, `space-y-3`
   - Bordas: ex: `rounded-lg`, `rounded-xl`, `rounded-full`
   - Sombras: ex: `shadow-md`, `shadow-xl`

2. **Mantenha a proporção**:
   - Se o card tem 300px na imagem, use `w-72` ou `w-80`
   - Se tem padding grande, use `p-6` ou `p-8`
   - Se tem gap pequeno, use `gap-2` ou `gap-3`

3. **Replique os detalhes**:
   - Badges, tags, labels com os mesmos estilos
   - Ícones nas mesmas posições
   - Avatares/imagens com mesmo tamanho/formato
   - Divisores, linhas separadoras

### Anti-patterns (Evitar)

❌ Ignorar a paleta de cores da referência
❌ Mudar o layout drasticamente
❌ Usar componentes muito diferentes
❌ Esquecer estados hover/active
❌ Não replicar espaçamentos
❌ Mudar tipografia sem motivo

---

## Arquitetura do Projeto (Referência)

```
src/
├── app/                    # Configurações globais (providers, router)
├── infrastructure/         # API client, storage
├── modules/                # Features isoladas (auth, game-session, etc)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── types.ts
└── shared/                 # Código reutilizável (UI components, utils, hooks)
```

**Organização sugerida:**
- Código específico de uma feature → `modules/[feature]/`
- Código genérico e reutilizável → `shared/`
- Configurações técnicas → `infrastructure/`

---

## Exemplos Rápidos

---

## Exemplos Rápidos

### Service + Hook com React Query

```typescript
// Service
export const gameService = {
  getAllGames: async () => {
    const response = await api_client.get('/games')
    return response.data
  }
}

// Hook
export const useGames = () => {
  const games_query = useQuery({
    queryKey: ['games'],
    queryFn: gameService.getAllGames
  })

  return {
    games: games_query.data ?? [],
    is_loading: games_query.isLoading
  }
}
```

### Componente com Form

```typescript
const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // lógica aqui
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Entrar
      </button>
    </form>
  )
}
```

---

## Notas Finais

- Mantenha o código simples e legível
- Use TypeScript para tudo
- Tailwind para estilos
- Siga as convenções de nomenclatura