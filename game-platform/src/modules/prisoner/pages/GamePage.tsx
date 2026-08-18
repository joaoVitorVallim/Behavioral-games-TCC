import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../components/PhaserGame';
import { useWebSocket } from '../hooks/useWebSocket';
import { eventBus, UI_EVENTS } from '../game/events';

export function GamePage() {
  const navigate = useNavigate();
  const playerId  = sessionStorage.getItem('playerId') ?? '';
  const matchId   = sessionStorage.getItem('matchId') ?? '';
  const isPlayer1 = sessionStorage.getItem('isPlayer1') === 'true';
  const finishedRef = useRef(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { submitChoice } = useWebSocket({
    matchId,
    playerId,
    onMatchFinished: (data) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      sessionStorage.setItem('matchResult', JSON.stringify(data));
      fallbackRef.current = setTimeout(() => navigate('/prisoner/result'), 15000);
    },
  });

  useEffect(() => {
    if (!playerId || !matchId) navigate('/sessions');
  }, []);

  useEffect(() => {
    const onSceneDone = () => {
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
      navigate('/prisoner/result');
    };
    eventBus.on(UI_EVENTS.SCENE_DONE, onSceneDone);
    return () => {
      eventBus.off(UI_EVENTS.SCENE_DONE, onSceneDone);
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#100c08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PhaserGame isPlayer1={isPlayer1} onChoice={submitChoice} />
    </div>
  );
}
