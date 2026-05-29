import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../socket';
import { api_client } from '../../../infrastructure/api/api-client';

export function WaitingPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Conectando...');
  const [dots, setDots] = useState('');
  const resolvedMatchId = useRef(sessionStorage.getItem('matchId') ?? '');

  const playerId  = sessionStorage.getItem('playerId') ?? '';
  const sessionId = sessionStorage.getItem('sessionId') ?? '';

  useEffect(() => {
    if (!playerId) {
      navigate('/sessions');
      return;
    }

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const joinMatch = (mId: string) => {
      socket.emit('joinMatch', { matchId: mId, playerId });
    };

    const onConnect = () => {
      setStatus('Aguardando outro suspeito');
      if (resolvedMatchId.current) joinMatch(resolvedMatchId.current);
    };

    const onJoined = () => setStatus('Aguardando outro suspeito');

    const onReady = (data: unknown) => {
      const d = data as { player1Id: string; matchId: string };
      const isPlayer1 = d.player1Id === playerId;
      sessionStorage.setItem('isPlayer1', String(isPlayer1));
      sessionStorage.setItem('matchId', d.matchId ?? resolvedMatchId.current);
      sessionStorage.setItem('matchReadyData', JSON.stringify(data));
      navigate('/prisoner/game');
    };

    const onError = (d: unknown) => {
      const err = d as { message: string };
      setStatus(`Erro: ${err.message}`);
    };

    socket.on('connect', onConnect);
    socket.on('joinedMatch', onJoined);
    socket.on('matchReady', onReady);
    socket.on('error', onError);

    if (socket.connected) onConnect();

    let pollInterval: ReturnType<typeof setInterval> | null = null;
    if (sessionId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await api_client.get('/matches', {
            params: { sessionId, playerId, status: 'aguardando' }
          });
          const matches: { id: string; player1_id: string; player2_id: string }[] = res.data;
          const myMatch = matches.find(m => m.player1_id === playerId || m.player2_id === playerId);
          if (!myMatch) return;
          const mId = myMatch.id;
          if (mId === resolvedMatchId.current) {
            // matchId confirmed as correct, stop polling
            clearInterval(pollInterval!);
            return;
          }
          // Found a different (or initial) match — update and join
          resolvedMatchId.current = mId;
          sessionStorage.setItem('matchId', mId);
          clearInterval(pollInterval!);
          if (socket.connected) joinMatch(mId);
        } catch {
          // network hiccup, try again next tick
        }
      }, 1500);
    }

    const dotsInterval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);

    return () => {
      socket.off('connect', onConnect);
      socket.off('joinedMatch', onJoined);
      socket.off('matchReady', onReady);
      socket.off('error', onError);
      if (pollInterval) clearInterval(pollInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div style={s.page}>
      <div style={s.panel}>
        <div style={s.topStripe} />
        <div style={s.inner}>
          <div style={s.badge}>SALA DE ESPERA</div>
          <div style={s.spinnerWrap}>
            <div style={s.spinner} />
          </div>
          <h2 style={s.title}>{status}{dots}</h2>
          <p style={s.sub}>O interrogatório começa quando ambos os suspeitos estiverem presentes na sala</p>
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
  page: {
    minHeight: '100vh',
    background: PAGE_BG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    padding: 16,
  },
  panel: {
    background: 'rgba(5, 12, 22, 0.97)',
    border: '1px solid #1e3a5a',
    borderRadius: 2,
    width: 'min(90vw, 420px)',
    boxShadow: '0 0 0 1px rgba(40,80,140,0.12), 0 12px 60px rgba(0,0,0,0.9)',
    overflow: 'hidden',
  },
  topStripe: { height: 3, background: 'linear-gradient(90deg, #0a3060, #2a78c0, #0a3060)' },
  bottomStripe: { height: 2, background: 'rgba(15,45,80,0.8)' },
  inner: { padding: '44px 36px 36px', textAlign: 'center' },
  badge: {
    display: 'inline-block',
    border: '1px solid #1e4a78',
    borderRadius: 1,
    color: '#4a9ad8',
    fontSize: 10,
    letterSpacing: 3,
    padding: '4px 14px',
    marginBottom: 32,
    textTransform: 'uppercase' as const,
  },
  spinnerWrap: { marginBottom: 28 },
  spinner: {
    width: 52,
    height: 52,
    border: '3px solid #0a2040',
    borderTop: '3px solid #3a90d0',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
  title: { color: '#8ac8ec', fontSize: 17, fontWeight: 700, marginBottom: 14, letterSpacing: 1 },
  sub: { color: '#2e5068', fontSize: 12, letterSpacing: 0.5, lineHeight: 1.7 },
};
