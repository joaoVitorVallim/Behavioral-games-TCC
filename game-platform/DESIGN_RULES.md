# Regras de Design - BehaviorLab

Este documento contém todas as regras e padrões de design estabelecidos para o projeto BehaviorLab.

---

## 🎨 Sistema de Cores

### Paleta Padrão (Tailwind Theme)
Sempre use as cores do tema Tailwind CSS definidas em `src/index.css`:

```css
--color-background: oklch(0.15 0.02 240)     /* Fundo principal escuro */
--color-foreground: oklch(0.98 0.01 240)     /* Texto principal claro */
--color-card: oklch(0.2 0.02 240)            /* Fundo de cards */
--color-primary: oklch(0.65 0.25 200)        /* Azul primário */
--color-primary-foreground: oklch(0.15 0.02 240) /* Texto em botões primários */
--color-muted-foreground: oklch(0.6 0.01 240)    /* Texto secundário */
--color-border: oklch(0.28 0.02 240)         /* Bordas */
--color-destructive: oklch(0.55 0.25 25)     /* Erros/avisos */
```

### Classes Tailwind a Usar
- **Fundos**: `bg-background`, `bg-card`, `bg-primary`
- **Textos**: `text-foreground`, `text-muted-foreground`, `text-primary-foreground`
- **Bordas**: `border-border`

❌ **NÃO usar cores customizadas** como `bg-[#050F25]`, `text-[#58A8F6]`, etc.

---

## 🧭 Navegação

### Logo Clicável
- **Todas as páginas** devem ter o logo BehaviorLab clicável
- **Sempre navega para `/`** (página inicial)
- Componente padrão:

```tsx
<button 
  onClick={() => navigate('/')} 
  className="flex items-center gap-3 hover:scale-105 transition-transform"
>
  <Brain className="w-8 h-8 text-primary" />
  <h1 className="text-foreground text-lg font-semibold">BehaviorLab</h1>
</button>
```

### Ícone do Logo
- **Sempre usar**: `<Brain />` do `lucide-react`
- Tamanho: `w-8 h-8`
- Cor: `text-primary`

---

## 🪟 Modais e Popups

### Regra Obrigatória: Botão X
**TODOS os modais/popups DEVEM ter um botão X** no canto superior direito para fechar.

```tsx
<button
  onClick={onClose}
  className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:scale-125 transition-all text-xl w-8 h-8 flex items-center justify-center leading-none"
  aria-label="Fechar"
>
  ✕
</button>
```

### Modal de Login
- Componente reutilizável: `LoginModal.tsx`
- Aberto pelo botão "Sou Docente" em **todas as páginas**
- Consistência: mesmo comportamento em `/` e `/sessions`

### Backdrop dos Modais
```tsx
<div 
  className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
  onClick={onClose}
>
```

---

### Estrutura do Card
```tsx
<div className="bg-card border border-border rounded-2xl p-6 hover:border-primary transition-all">
  {/* Ícone + Título + Subtítulo */}
  
  {/* Descrição */}
  
  {/* Apenas Data + Botão Entrar */}
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-1.5">
      {/* Ícone calendário */}
      {session.date}
    </span>
    <button>Entrar</button>
  </div>
</div>
```

---

## 🖱️ Efeitos de Hover em Botões

### Regra Universal
**TODOS os botões DEVEM ter efeito de hover** com:
1. **Aumento de tamanho** (`scale`)
2. **Inversão de cor do texto** (quando aplicável)

### Tipos de Hover

#### 1. Botões Primários
Botões com fundo colorido (bg-primary):

```tsx
className="bg-primary text-primary-foreground hover:scale-105 hover:text-background transition-all"
```

- **Escala**: `hover:scale-105` (aumenta 5%)
- **Cor do texto**: muda de `primary-foreground` (claro) para `background` (escuro)

**Exemplos:**
- "Sou Docente"
- "Ver Sessões Disponíveis"
- "Entrar" (nos cards)
- "Continuar" / "Entrar na Sessão" (modais)
- "Entrar no Sistema" (login)

#### 2. Botões de Ícone
Botões pequenos apenas com ícone:

```tsx
className="text-muted-foreground hover:scale-110 hover:text-foreground transition-all"
```

- **Escala**: `hover:scale-110` (aumenta 10%)
- **Cor**: muda de `muted-foreground` (cinza) para `foreground` (branco/preto)

**Exemplo:** Botão de reload (atualizar sessões)

#### 3. Botões X (Fechar)
Botões de fechar modais:

```tsx
className="text-muted-foreground hover:text-foreground hover:scale-125 transition-all"
```

- **Escala**: `hover:scale-125` (aumenta 25%)
- **Cor**: muda de `muted-foreground` para `foreground`

#### 4. Botões de Navegação (Logo)
```tsx
className="hover:scale-105 transition-transform"
```

- **Escala**: `hover:scale-105`
- Sem mudança de cor (mantém as cores do logo)

### Estados Desabilitados
Quando o botão está desabilitado:

```tsx
className="disabled:opacity-50 disabled:hover:scale-100 disabled:hover:text-primary-foreground"
```

- **Não aumenta** quando hover em estado desabilitado
- **Não muda cor** de texto
- **Opacidade reduzida**: `opacity-50`

---

## 📐 Espaçamentos e Tamanhos

### Cards
- Padding: `p-6`
- Border radius: `rounded-2xl`
- Gap entre elementos: `gap-3`, `gap-4`, `gap-6`

### Modais
- Max width: `max-w-md` (médio) ou `max-w-[500px]`
- Padding: `p-8 md:p-10`
- Border radius: `rounded-3xl`

### Botões
- **Primários grandes**: `py-4` (vertical), `px-8` (horizontal)
- **Primários médios**: `py-3.5`, `px-5`
- **Secundários**: `py-2.5`, `px-8`
- **Pequenos**: `py-2`, `px-5`

---

## 🎯 Hierarquia Visual

### Títulos
- **Principal (H1)**: `text-4xl font-bold`
- **Seção (H2)**: `text-2xl font-bold`
- **Card (H3)**: `text-base font-semibold`
- **Modal**: `text-xl font-bold`

### Textos
- **Corpo**: `text-sm` ou `text-base`
- **Secundário**: `text-xs text-muted-foreground`
- **Labels**: `text-xs uppercase tracking-widest font-semibold`

---

## 🔄 Transições

### Padrão para Múltiplas Propriedades
```tsx
transition-all
```
Use quando há mudanças em cor, tamanho, opacidade, etc.

### Específicas
```tsx
transition-transform  /* Apenas para scale/translate */
transition-colors     /* Apenas cores */
transition-opacity    /* Apenas opacidade */
```

### Duração
A duração padrão do Tailwind é suficiente (150ms). Não é necessário especificar `duration-*`.

---

## 📱 Responsividade

### Breakpoints
- Mobile first: estilos base para mobile
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)

### Grid de Cards
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### Padding Responsivo
```tsx
className="p-8 md:p-10"  /* Modais */
className="px-4 py-12"   /* Páginas */
```

---

## ✨ Detalhes Visuais

### Sombras
- **Cards**: `shadow-xl` (no hover), `shadow-2xl` (modais)
- **Botões**: geralmente sem sombra (flat design)

### Estados de Hover em Cards
```tsx
className="hover:border-primary transition-all"
```

### Inputs
```tsx
className="bg-input border border-border rounded-xl px-4 py-3 
           text-foreground placeholder:text-muted-foreground 
           outline-none focus:border-primary transition-colors"
```

---

## 🚫 Anti-patterns (Evitar)

❌ Cores hardcoded: `bg-[#050F25]`, `text-[#58A8F6]`  
❌ Botões sem hover  
❌ Modais sem botão X  
❌ Logo sem link para home  
❌ Cards com informações desnecessárias (categoria/sala/turma)  
❌ Transições muito lentas (`duration-1000`)  
❌ Múltiplos estados de view na mesma página (use modais)  

---

## ✅ Checklist de Componente

Ao criar um novo componente, verifique:

- [ ] Usa cores do tema Tailwind (`bg-background`, `text-foreground`, etc.)
- [ ] Todos os botões têm hover com `scale` e inversão de cor
- [ ] Modais têm botão X funcionando
- [ ] Logo (se presente) navega para `/`
- [ ] Transições suaves com `transition-all` ou específicas
- [ ] Estados desabilitados tratados corretamente
- [ ] Responsivo com breakpoints `md:` e `lg:`
- [ ] Nomenclatura: `snake_case` (variáveis), `camelCase` (funções), `PascalCase` (componentes)

---

## 📚 Componentes Padrão

### Header
```tsx
<header className="bg-card border-b border-border">
  <div className="max-w-350 mx-auto px-8 py-4 flex items-center justify-between">
    <button onClick={() => navigate('/')}>
      <Brain className="w-8 h-8 text-primary" />
      <h1>BehaviorLab</h1>
    </button>
    
    <button onClick={() => setShowLoginModal(true)}>
      Sou Docente
    </button>
  </div>
</header>
```

### Modal Wrapper
```tsx
<div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={onClose}>
  <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
    <button onClick={onClose} className="absolute top-5 right-5 ...">✕</button>
    {/* Conteúdo */}
  </div>
</div>
```

### Botão Primário
```tsx
<button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg 
                   hover:scale-105 hover:text-background transition-all">
  Texto
</button>
```

---

## 🎓 Filosofia de Design

1. **Consistência**: Mesmo comportamento em todas as páginas
2. **Feedback Visual**: Todo clique/hover tem resposta visual
3. **Acessibilidade**: Sempre use `aria-label` em botões de ícone
4. **Simplicidade**: Remova informações desnecessárias
5. **Responsividade**: Mobile-first, progressivamente melhorado
6. **Performance**: Transições suaves mas não excessivas

---

**Última atualização**: Fevereiro 2026  
**Projeto**: BehaviorLab - Plataforma de Análise Comportamental FHO
