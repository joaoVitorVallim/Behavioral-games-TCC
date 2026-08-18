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
    (choice: 'cooperate' | 'defect', round?: number) => {
      getSocket().emit('submitChoice', {
        matchId,
        playerId,
        choice,
        ...(round !== undefined ? { round } : {}),
      });
    },
    [matchId, playerId],
  );

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      if (matchId && playerId) socket.emit('joinMatch', { matchId, playerId });
    };
    socket.on('connect', handleConnect);
    if (!socket.connected) socket.connect();

    const stampArrival = (d: unknown) =>
      ({ ...(d as Record<string, unknown>), receivedAt: Date.now() });

    const handleMatchReady = (d: unknown) => {
      const stamped = stampArrival(d);
      try {
        sessionStorage.setItem('matchReadyData', JSON.stringify(stamped));
      } catch { }
      eventBus.emit(GAME_EVENTS.MATCH_READY, stamped);
    };
    const handleRoundStart     = (d: unknown) => eventBus.emit(GAME_EVENTS.ROUND_START, stampArrival(d));
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
    socket.off('matchReady');
    socket.off('roundStart');
    socket.off('choiceReceived');
    socket.off('roundResult');
    socket.off('roundTimeout');
    socket.off('matchFinished');
    socket.off('playerDisconnected');
    
    socket.on('matchReady',     handleMatchReady);
    socket.on('roundStart',     handleRoundStart);
    socket.on('choiceReceived', handleChoiceReceived);
    socket.on('roundResult',    handleRoundResult);
    socket.on('roundTimeout',   handleRoundTimeout);
    socket.on('matchFinished',  handleMatchFinished);
    socket.on('playerDisconnected', handleDisconnected);
    socket.on('error', handleError);

    return () => {
      socket.off('connect',        handleConnect);
      socket.off('matchReady',     handleMatchReady);
      socket.off('roundStart',     handleRoundStart);
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
