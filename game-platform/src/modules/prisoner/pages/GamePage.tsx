import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../components/PhaserGame';
import { useWebSocket } from '../hooks/useWebSocket';

export function GamePage() {
  const navigate = useNavigate();
  const playerId  = sessionStorage.getItem('playerId') ?? '';
  const matchId   = sessionStorage.getItem('matchId') ?? '';
  const isPlayer1 = sessionStorage.getItem('isPlayer1') === 'true';
  const finishedRef = useRef(false);

  const { submitChoice } = useWebSocket({
    matchId,
    playerId,
    onMatchFinished: (data) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      sessionStorage.setItem('matchResult', JSON.stringify(data));
      setTimeout(() => navigate('/prisoner/result'), 2800);
    },
  });

  useEffect(() => {
    if (!playerId || !matchId) navigate('/sessions');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#100c08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PhaserGame isPlayer1={isPlayer1} onChoice={submitChoice} />
    </div>
  );
}
