import type { ReactNode } from "react"
import { Layers, Lock, Sigma, Timer, Users } from "lucide-react"
import { Badge, panelClass } from "./MatchShell"
import { DEFAULT_PAYOFF, type PayoffPair, type PayoffTable } from "../types"

type Props = {
  payoff?: PayoffTable
  onReady: () => void
  disabled?: boolean
  opponentName?: string
}

const BLACK = "#15171D"
const RED = "#DA2128"

/** Regra resumida num bloco compacto; as cinco ficam lado a lado, à direita do título. */
function Tile({ label, children, dark = false }: { label: string; children: ReactNode; dark?: boolean }) {
  return (
    <li
      className={`flex w-[clamp(84px,6vw,104px)] flex-col gap-2 rounded-[18px] p-2.5 ${
        dark
          ? "bg-[linear-gradient(165deg,#12151B,#272C36)] shadow-[0_8px_0_-3px_#E4E8EE]"
          : "bg-[linear-gradient(165deg,#0C8AE6,#0068C8)] shadow-[0_8px_0_-3px_#D7EAF8]"
      }`}
    >
      <p className="flex min-h-[2.3em] items-center justify-center text-center text-[13px] font-extrabold leading-tight tracking-tight text-white">
        {label}
      </p>
      <div className="flex h-[clamp(36px,5.4dvh,50px)] items-center justify-center gap-1.5 rounded-xl bg-white/15 text-white">
        {children}
      </div>
    </li>
  )
}

function MiniCard({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[#5C6675]">{label}</span>
      <span
        className="flex aspect-[80/86] h-[var(--mini-h)] items-end justify-center rounded-[10px] pb-[clamp(4px,0.9dvh,8px)] shadow-[inset_0_0_0_2.5px_rgba(255,255,255,.22),0_8px_16px_-8px_rgba(9,25,48,.45)]"
        style={{ background: color }}
      >
        <span className="whitespace-nowrap text-[clamp(8px,1.15dvh,10.5px)] font-extrabold tracking-[0.06em] text-white">
          {color === RED ? "VERMELHO" : "PRETO"}
        </span>
      </span>
    </span>
  )
}

function ComboCard({
  you,
  opponent,
  points,
  note,
  tone,
  opponentName,
}: {
  you: string
  opponent: string
  points: PayoffPair
  note: string
  tone: "good" | "neutral" | "bad"
  opponentName: string
}) {
  const skin = {
    good: ["bg-[#E7F7EE] border-[#BEE7CF]", "bg-[#D2EFDF] text-[#0A6238]", "text-[#0B7A43]"],
    neutral: ["bg-white border-[#E6EEF6]", "bg-[#EEF2F7] text-[#3C4654]", "text-[#12151B]"],
    bad: ["bg-[#FDECEC] border-[#F6C9C9]", "bg-[#FAD9D9] text-[#961F24]", "text-[#B3262C]"],
  }[tone]

  const value = (n: number) => (n === 0 ? "0" : `+${n}`)

  return (
    <div className={`flex flex-col gap-[clamp(8px,1.4dvh,14px)] rounded-[20px] border-2 p-[clamp(10px,1.8dvh,16px)] ${skin[0]}`}>
      <div className="flex items-end justify-center gap-3">
        <MiniCard color={you} label="Você" />
        <span className="flex h-[var(--mini-h)] items-center text-[15px] font-extrabold text-[#5C6675]">+</span>
        <MiniCard color={opponent} label={opponentName} />
      </div>
      <div className="flex flex-col gap-1 rounded-[14px] bg-white px-3 py-[clamp(6px,1.1dvh,10px)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13.5px] font-bold text-[#3C4654]">Você ganha</span>
          <span
            className={`text-[clamp(18px,2.6dvh,22px)] font-black leading-tight tracking-tight ${points[0] === 0 ? "text-[#3C4654]" : skin[2]}`}
          >
            {value(points[0])}
          </span>
        </div>
        <div className="h-[1.5px] bg-[#EEF2F7]" />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13.5px] font-bold text-[#3C4654]">{opponentName} ganha</span>
          <span
            className={`text-[clamp(18px,2.6dvh,22px)] font-black leading-tight tracking-tight ${points[1] === 0 ? "text-[#3C4654]" : skin[2]}`}
          >
            {value(points[1])}
          </span>
        </div>
      </div>
      <p
        className={`flex flex-1 items-center justify-center rounded-[10px] px-2.5 py-1 text-center text-[13px] font-bold leading-snug ${skin[1]}`}
      >
        {note}
      </p>
    </div>
  )
}

/**
 * Tela 2 — regras da partida. Nenhum número de rodadas fixo: tudo vem do backend.
 * Layout largo para caber numa tela só: título e regras em cima, as quatro combinações numa
 * linha, nota e botão embaixo. Só o bloco das combinações rola, e só se faltar espaço.
 */
export function HowToPlayScreen({ payoff = DEFAULT_PAYOFF, onReady, disabled, opponentName = "Jogador 2" }: Props) {
  return (
    <div
      className={`${panelClass} flex max-w-[1440px] flex-col gap-[clamp(10px,1.8dvh,24px)] [--mini-h:clamp(50px,8dvh,86px)]`}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <div className="min-w-[300px] flex-1">
          <Badge>Como jogar</Badge>
          <h1 className="mt-3 text-[clamp(26px,3.7dvh,40px)] font-black leading-[1.05] tracking-[-0.04em]">
            Uma carta por rodada. Decisão simultânea.
          </h1>
          <p className="mt-2 max-w-[620px] text-[clamp(14px,1.9dvh,16.5px)] font-medium leading-relaxed text-[#5C6675]">
            Em cada rodada, você e o outro jogador escolhem uma carta ao mesmo tempo. Os pontos saem da combinação das
            duas.
          </p>
        </div>

        <ul className="flex flex-wrap gap-2.5">
          <Tile label="2 jogadores">
            <Users className="h-6 w-6" />
          </Tile>
          <Tile label="rodadas seguidas">
            <Layers className="h-6 w-6" />
          </Tile>
          <Tile label="2 cartas">
            <span className="h-[26px] w-[19px] -rotate-6 rounded-md bg-[#15171D] shadow-[inset_0_0_0_2px_rgba(255,255,255,.2)]" />
            <span className="h-[26px] w-[19px] rotate-6 rounded-md bg-[#DA2128] shadow-[inset_0_0_0_2px_rgba(255,255,255,.35)]" />
          </Tile>
          <Tile label="escolha simultânea">
            <Timer className="h-6 w-6" />
          </Tile>
          <Tile label="escolha definitiva" dark>
            <Lock className="h-6 w-6" />
          </Tile>
        </ul>
      </header>

      <section className="flex min-h-0 flex-col rounded-[26px] border-2 border-[#E6EEF6] bg-[#F7FAFD] p-[clamp(10px,1.8dvh,20px)]">
        <div className="mb-[clamp(8px,1.6dvh,16px)] flex shrink-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-[clamp(18px,2.6dvh,22px)] font-black tracking-[-0.03em]">Todas as jogadas possíveis</h2>
          <p className="text-[14px] font-medium leading-snug text-[#3C4654]">
            Em cada rodada, sua carta e a do {opponentName} formam uma destas quatro combinações.
          </p>
        </div>

        {/* Sempre numa linha: numa tela estreita o bloco rola para o lado, em vez de crescer para baixo. */}
        <div className="grid min-h-0 auto-cols-[minmax(230px,1fr)] grid-flow-col gap-3 overflow-auto pb-1 [scrollbar-width:thin]">
          <ComboCard you={BLACK} opponent={BLACK} points={payoff.bothBlack} tone="neutral" opponentName={opponentName}
            note="Os dois escolhem preto: ganho equilibrado para os dois." />
          <ComboCard you={BLACK} opponent={RED} points={payoff.blackRed} tone="neutral" opponentName={opponentName}
            note={`Você não pontua; o ${opponentName} obtém o ganho máximo.`} />
          <ComboCard you={RED} opponent={BLACK} points={payoff.redBlack} tone="neutral" opponentName={opponentName}
            note={`Você obtém o ganho máximo; o ${opponentName} não pontua.`} />
          <ComboCard you={RED} opponent={RED} points={payoff.bothRed} tone="neutral" opponentName={opponentName}
            note="Os dois escolhem vermelho: ganho mínimo para ambos." />
        </div>
      </section>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div className="flex min-w-[280px] max-w-[640px] flex-1 items-center gap-2.5 rounded-2xl border-2 border-[#E6EEF6] bg-white px-3.5 py-3">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-[#00A3F5] text-white">
            <Sigma className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold leading-snug text-[#3C4654]">
            No fim da partida, somamos os seus pontos de todas as rodadas jogadas. O número de rodadas aparece no placar
            no topo da tela.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <p className="max-w-[210px] text-right text-[13px] font-semibold leading-snug text-[#5C6675]">
            A partida começa quando os dois jogadores estiverem prontos.
          </p>
          <button
            type="button"
            onClick={onReady}
            disabled={disabled}
            className="shrink-0 animate-[dpGlow_2.2s_ease-in-out_infinite] rounded-full bg-[#00A3F5] px-13 py-[clamp(12px,2.2dvh,19px)] text-xl font-black tracking-[0.06em] text-[#08243C] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-60"
          >
            ESTOU PRONTO
          </button>
        </div>
      </footer>
    </div>
  )
}
