import { Badge, FitToScreen, PlayerSlot, ShimmerBar, VsBadge, panelClass } from "./MatchShell"

type Props = {
  opponentJoined: boolean
  playerName?: string
  opponentName?: string
  onReviewRules?: () => void
}

/** Tela 1 — sala de espera. `opponentJoined` vem do socket. */
export function WaitingRoomScreen({
  opponentJoined,
  playerName = "Você",
  opponentName = "Jogador 2",
  onReviewRules,
}: Props) {
  return (
    <FitToScreen>
      <div className={`${panelClass} max-w-[620px] text-center`}>
        <Badge pulse>Sala de espera</Badge>

        {/* leque de cartas */}
        <div className="relative my-4 flex h-[150px] items-center justify-center">
          <div className="absolute -ml-[118px] flex h-[120px] w-[86px] rotate-[-16deg] animate-[dpFloat_3.4s_ease-in-out_infinite] items-center justify-center rounded-[14px] bg-[#15171D] shadow-[inset_0_0_0_3px_rgba(255,255,255,.14),0_16px_26px_-12px_rgba(9,25,48,.6)]">
            <span className="h-[42px] w-[42px] rounded-[10px] bg-white/15" />
          </div>
          <div className="absolute z-[2] flex h-[128px] w-[92px] rotate-[5deg] animate-[dpFloat_3.4s_ease-in-out_.5s_infinite] items-center justify-center rounded-[14px] bg-[linear-gradient(160deg,#0C8AE6,#0068C8)] shadow-[inset_0_0_0_3px_rgba(255,255,255,.22),0_18px_30px_-12px_rgba(0,80,160,.65)]">
            <span className="h-[26px] w-[26px] animate-spin rounded-full border-[3px] border-white/85 border-t-transparent" />
          </div>
          <div className="absolute ml-[118px] flex h-[120px] w-[86px] rotate-[19deg] animate-[dpFloat_3.4s_ease-in-out_1s_infinite] items-center justify-center rounded-[14px] bg-[#DA2128] shadow-[inset_0_0_0_3px_rgba(255,255,255,.28),0_16px_26px_-12px_rgba(150,20,25,.5)]">
            <span className="h-[40px] w-[40px] rotate-45 rounded-md bg-white/90" />
          </div>
        </div>

        <h1 className="mb-2 text-[40px] font-black leading-[1.02] tracking-[-0.035em]">
          {opponentJoined ? `${opponentName} entrou na sala.` : "Aguardando o outro jogador…"}
        </h1>
        <p className="mx-auto max-w-[420px] text-[16.5px] font-medium leading-relaxed text-[#5C6675]">
          {opponentJoined
            ? "Sala completa. Abrindo as regras da partida…"
            : "A partida começa no instante em que os dois jogadores entrarem na sala."}
        </p>

        <div className="my-7 flex items-center justify-center gap-3.5">
          <PlayerSlot name={playerName} status="na sala" state="in" initials={playerName.charAt(0).toUpperCase()} />
          <VsBadge />
          {opponentJoined ? (
            <PlayerSlot name={opponentName} status="entrou" state="in" initials="J2" />
          ) : (
            <PlayerSlot name={opponentName} status="entrando" state="pending" />
          )}
        </div>

        <ShimmerBar />

        <div className="mt-6 flex items-center gap-2.5 rounded-2xl border-2 border-[#FBE7B4] bg-[#FFF8E6] px-4 py-3 text-left">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-[#F5B93B] text-[15px] font-extrabold text-white">
            !
          </span>
          <p className="text-sm font-semibold leading-snug text-[#6B5A2A]">
            Aproveite a espera para revisar{" "}
            <button type="button" onClick={onReviewRules} className="font-bold text-[#0077DB] underline-offset-2 hover:underline">
              como jogar
            </button>
            .
          </p>
        </div>

        <p className="mt-5 text-[13.5px] font-semibold text-[#5C6675]">Travou? Chame o professor.</p>
      </div>
    </FitToScreen>
  )
}
