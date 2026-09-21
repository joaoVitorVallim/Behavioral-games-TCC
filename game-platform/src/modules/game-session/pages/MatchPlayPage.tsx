import { MatchShell } from "../components/MatchShell"
import { RoundScreen } from "../components/RoundScreen"
import { ResultScreen } from "../components/ResultScreen"
import { useMatchRound } from "../hooks/useMatchRound"

/** Partida em andamento: rodadas e resultado final. */
export function MatchPlayPage() {
  const match = useMatchRound()

  return (
    <MatchShell>
      {match.ready &&
        (match.phase === "finished" ? (
          <ResultScreen
            youScore={match.youScore}
            oppScore={match.oppScore ?? 0}
            history={match.history}
            onNewSession={match.newSession}
          />
        ) : (
          <RoundScreen
            round={match.round}
            totalRounds={match.totalRounds}
            youScore={match.youScore}
            oppScore={match.oppScore}
            phase={match.phase}
            timeLeft={match.timeLeft}
            secondsPerRound={match.secondsPerRound}
            yourCard={match.yourCard}
            opponentCard={match.opponentCard}
            roundPoints={match.roundPoints}
            playedByTime={match.playedByTime}
            opponentAway={match.opponentAway}
            onPick={match.pick}
            onNext={match.next}
          />
        ))}
    </MatchShell>
  )
}
