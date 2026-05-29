import { useEffect, useCallback } from 'react';
import { getSocket } from '../socket';
import { eventBus, GAME_EVENTS } from '../game/events';

interface UseWebSocketOptions {
  matchId: string;
  playerId: string;
  onMatchFinished?: (data: unknown) => void;
  onPlayerDisconnected?: () => void;
}

export function useWebSocket({ matchId, playerId, onMatchFinished, onPlayerDisconnected }: UseWebSocketOptions) {
  const submitChoice = useCallback(
    (choice: 'cooperate' | 'defect') => {
      getSocket().emit('submitChoice', { matchId, playerId, choice });
    },
    [matchId, playerId],
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleChoiceReceived = (d: unknown) => eventBus.emit(GAME_EVENTS.CHOICE_RECEIVED, d);
    const handleRoundResult    = (d: unknown) => eventBus.emit(GAME_EVENTS.ROUND_RESULT, d);
    const handleRoundTimeout   = (d: unknown) => eventBus.emit(GAME_EVENTS.ROUND_TIMEOUT, d);

    const handleMatchFinished = (d: unknown) => {
      eventBus.emit(GAME_EVENTS.MATCH_FINISHED, d);
      onMatchFinished?.(d);
    };

    const handleDisconnected = () => {
      eventBus.emit(GAME_EVENTS.PLAYER_DISCONNECTED, {});
      onPlayerDisconnected?.();
    };

    const handleError = (d: unknown) => {
      const err = d as { message?: string };
      console.error('[WS] Server error:', err.message ?? d);
    };

    // Defensivo: remove qualquer listener residual de uma partida anterior
    // antes de registrar os novos, evitando handlers duplicados (ex.: animação
    // de virada de carta disparando duas vezes no segundo jogo da sessão).
    socket.off('choiceReceived');
    socket.off('roundResult');
    socket.off('roundTimeout');
    socket.off('matchFinished');
    socket.off('playerDisconnected');

    socket.on('choiceReceived', handleChoiceReceived);
    socket.on('roundResult',    handleRoundResult);
    socket.on('roundTimeout',   handleRoundTimeout);
    socket.on('matchFinished',  handleMatchFinished);
    socket.on('playerDisconnected', handleDisconnected);
    socket.on('error', handleError);

    return () => {
      socket.off('choiceReceived', handleChoiceReceived);
      socket.off('roundResult',    handleRoundResult);
      socket.off('roundTimeout',   handleRoundTimeout);
      socket.off('matchFinished',  handleMatchFinished);
      socket.off('playerDisconnected', handleDisconnected);
      socket.off('error', handleError);
    };
  }, [matchId, playerId]);

  return { submitChoice };
}
