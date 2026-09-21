import { Badge, FitToScreen, PlayerSlot, ShimmerBar, VsBadge, panelClass } from "./MatchShell"

type Props = {
  opponentReady: boolean
  /** Segundos restantes; `null` enquanto ninguém iniciou a contagem. */
  countdown: number | null
  started?: boolean
  onReviewRules?: () => void
  playerName?: string
  opponentName?: string
}

/** Tela 3 — confirmação dos dois jogadores e contagem para o início. */
export function ReadyScreen({
  opponentReady,
  countdown,
  started = false,
  onReviewRules,
  playerName = "Você",
  opponentName = "Jogador 2",
}: Props) {
  const [title, subtitle, mark] = started
    ? ["A partida começou.", "Cada decisão vale pontos até a última rodada.", "▶"]
    : countdown !== null
      ? ["A partida começa em…", "Sua primeira escolha será entre preto e vermelho.", String(Math.max(countdown, 1))]
      : ["Você confirmou que está pronto.", `A partida começa quando o ${opponentName} também confirmar.`, "✓"]

  return (
    <FitToScreen>
      <div className={`${panelClass} max-w-[620px] text-center`}>
        <Badge pulse>Confirmação</Badge>

        <div className="my-4 flex h-[132px] items-center justify-center">
          <span className="flex h-[118px] w-[118px] animate-[dpBob_2.2s_ease-in-out_infinite] items-center justify-center rounded-full border-[3px] border-[#BFE2FA] bg-[#F2F8FE] text-[46px] font-black tracking-[-0.04em] text-[#0069C4]">
            {mark}
          </span>
        </div>

        <h1 className="mb-2 text-[38px] font-black leading-[1.04] tracking-[-0.035em]">{title}</h1>
        <p className="mx-auto max-w-[420px] text-[16.5px] font-medium leading-relaxed text-[#5C6675]">{subtitle}</p>

        <div className="my-6 flex items-center justify-center gap-3.5">
          <PlayerSlot name={playerName} status="pronto" state="ready" />
          <VsBadge />
          {opponentReady ? (
            <PlayerSlot name={opponentName} status="pronto" state="ready" />
          ) : (
            <PlayerSlot name={opponentName} status="lendo as regras" state="pending" />
          )}
        </div>

        <ShimmerBar />

        <p className="mt-5 text-[13.5px] font-semibold text-[#5C6675]">
          Precisa revisar as regras?{" "}
          <button type="button" onClick={onReviewRules} className="font-bold text-[#0077DB] underline-offset-2 hover:underline">
            Rever como jogar
          </button>
        </p>
      </div>
    </FitToScreen>
  )
}
