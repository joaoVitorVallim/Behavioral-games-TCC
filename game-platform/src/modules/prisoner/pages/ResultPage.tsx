import React from 'react';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket } from '../socket';

interface MoveData {
  player1Choice: 'cooperate' | 'defect';
  player2Choice: 'cooperate' | 'defect';
  player1Points: number;
  player2Points: number;
}

interface MatchResult {
  matchId: string;
  finalScore: { player1: number; player2: number };
  moves: Record<string, MoveData>;
}

const CHOICE_LABEL = { cooperate: 'Silêncio', defect: 'Delatou' };
const CHOICE_COLOR = { cooperate: '#3ab880', defect: '#c04040' };

export function ResultPage() {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem('matchResult');
  const isPlayer1 = sessionStorage.getItem('isPlayer1') === 'true';

  if (!raw) {
    navigate('/sessions');
    return null;
  }

  const result: MatchResult = JSON.parse(raw);
  const { finalScore, moves } = result;

  const myScore  = isPlayer1 ? finalScore.player1 : finalScore.player2;
  const oppScore = isPlayer1 ? finalScore.player2 : finalScore.player1;

  const verdictText  = myScore > oppScore ? 'ABSOLVIDO — VOCÊ VENCEU'
    : myScore < oppScore ? 'CONDENADO — VOCÊ PERDEU'
    : 'VEREDICTO INCONCLUSIVO';
  const verdictColor = myScore > oppScore ? '#3ad898'
    : myScore < oppScore ? '#c04040'
    : '#6aaad8';

  const rounds = Object.entries(moves)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([round, m]) => ({
      round,
      myChoice:  isPlayer1 ? m.player1Choice : m.player2Choice,
      oppChoice: isPlayer1 ? m.player2Choice : m.player1Choice,
      myPts:     isPlayer1 ? m.player1Points  : m.player2Points,
    }));

  return (
    <div style={s.page}>
      <div style={s.panel}>
        <div style={s.topStripe} />
        <div style={s.inner}>
          <div style={s.badge}>VEREDICTO FINAL — DELEGACIA Nº 1</div>
          <h1 style={{ ...s.verdict, color: verdictColor }}>{verdictText}</h1>

          <div style={s.scoreRow}>
            <div style={s.scoreBox}>
              <div style={s.scoreLabel}>VOCÊ</div>
              <div style={{ ...s.scoreVal, color: myScore >= oppScore ? '#3ad898' : '#8ab8d8' }}>{myScore}</div>
              <div style={s.scoreSub}>pontos</div>
            </div>
            <div style={s.vs}>×</div>
            <div style={s.scoreBox}>
              <div style={s.scoreLabel}>SUSPEITO</div>
              <div style={{ ...s.scoreVal, color: oppScore > myScore ? '#c04040' : '#4a6a80' }}>{oppScore}</div>
              <div style={s.scoreSub}>pontos</div>
            </div>
          </div>

          <h3 style={s.tableTitle}>REGISTRO DE INTERROGATÓRIO</h3>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>RODADA</th>
                <th style={s.th}>VOCÊ</th>
                <th style={s.th}>SUSPEITO</th>
                <th style={s.th}>PONTOS</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map(r => (
                <tr key={r.round}>
                  <td style={s.td}>{r.round}</td>
                  <td style={{ ...s.td, color: CHOICE_COLOR[r.myChoice] }}>{CHOICE_LABEL[r.myChoice]}</td>
                  <td style={{ ...s.td, color: CHOICE_COLOR[r.oppChoice] }}>{CHOICE_LABEL[r.oppChoice]}</td>
                  <td style={{ ...s.td, color: r.myPts > 0 ? '#3ab880' : '#c04040' }}>
                    {r.myPts > 0 ? `+${r.myPts}` : r.myPts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button style={s.btn} onClick={() => {
            disconnectSocket();
            sessionStorage.removeItem('matchId');
            sessionStorage.removeItem('matchResult');
            sessionStorage.removeItem('matchReadyData');
            sessionStorage.removeItem('playerId');
            sessionStorage.removeItem('sessionId');
            sessionStorage.removeItem('isPlayer1');
            navigate('/sessions');
          }}>NOVA SESSÃO</button>
        </div>
        <div style={s.bottomStripe} />
      </div>
    </div>
  );
}

const PAGE_BG = [
  'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(100,180,255,0.10) 0%, transparent 55%)',
  'radial-gradient(ellipse at 20% 80%, rgba(0,50,100,0.45) 0%, transparent 50%)',
  'radial-gradient(ellipse at 80% 20%, rgba(0,30,80,0.35) 0%, transparent 50%)',
  'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,0.70) 100%)',
  'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.015) 59px, rgba(255,255,255,0.015) 60px)',
  'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.015) 59px, rgba(255,255,255,0.015) 60px)',
  'linear-gradient(180deg, #080e1c 0%, #05090f 60%, #030608 100%)',
].join(', ');

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: 24 },
  panel: { background: 'rgba(5, 12, 22, 0.97)', border: '1px solid #1e3a5a', borderRadius: 2, width: 'min(90vw, 480px)', boxShadow: '0 0 0 1px rgba(40,80,140,0.12), 0 12px 60px rgba(0,0,0,0.9)', overflow: 'hidden' },
  topStripe: { height: 3, background: 'linear-gradient(90deg, #0a3060, #2a78c0, #0a3060)' },
  bottomStripe: { height: 2, background: 'rgba(15,45,80,0.8)' },
  inner: { padding: '32px 28px 28px', textAlign: 'center' },
  badge: { display: 'inline-block', border: '1px solid #1e4a78', borderRadius: 1, color: '#4a9ad8', fontSize: 9, letterSpacing: 2, padding: '4px 12px', marginBottom: 18, textTransform: 'uppercase' as const },
  verdict: { fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 26, textAlign: 'center' },
  scoreRow: { display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center' },
  scoreBox: { flex: 1, background: 'rgba(3, 8, 16, 0.8)', border: '1px solid #1a3050', borderRadius: 2, padding: '16px 12px', textAlign: 'center' },
  scoreLabel: { color: '#3a6888', fontSize: 10, letterSpacing: 2.5, marginBottom: 8 },
  scoreVal: { fontSize: 42, fontWeight: 700, lineHeight: 1, marginBottom: 6 },
  scoreSub: { color: '#2a4a60', fontSize: 10, letterSpacing: 1 },
  vs: { color: '#1e3a50', fontSize: 22, fontWeight: 700 },
  tableTitle: { color: '#3a7098', fontSize: 10, marginBottom: 10, letterSpacing: 3, textAlign: 'left' as const },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 24 },
  th: { background: 'rgba(3, 8, 16, 0.8)', color: '#3a6888', fontSize: 10, padding: '8px 10px', textAlign: 'left' as const, letterSpacing: 1.5, borderBottom: '1px solid #1a3050' },
  td: { color: '#8ab8d8', fontSize: 13, padding: '7px 10px', borderBottom: '1px solid #0a1828' },
  btn: { width: '100%', background: '#071830', border: '1px solid #2a70b8', borderRadius: 2, color: '#6abcec', cursor: 'pointer', fontSize: 14, fontWeight: 700, letterSpacing: 3, padding: 15, fontFamily: 'monospace' },
};
