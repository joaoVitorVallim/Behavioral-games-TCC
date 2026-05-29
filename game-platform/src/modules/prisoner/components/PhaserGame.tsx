import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/GameScene';
import { eventBus, GAME_EVENTS, PLAYER_EVENTS } from '../game/events';

interface PhaserGameProps {
  isPlayer1: boolean;
  onChoice: (choice: 'cooperate' | 'defect') => void;
}

export function PhaserGame({ onChoice }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const scene = new GameScene();

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: 480,
      height: 640,
      backgroundColor: '#100c08',
      parent: containerRef.current,
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    const onSubmit = (choice: unknown) => onChoice(choice as 'cooperate' | 'defect');
    eventBus.on(PLAYER_EVENTS.SUBMIT_CHOICE, onSubmit);

    return () => {
      eventBus.off(PLAYER_EVENTS.SUBMIT_CHOICE, onSubmit);
      Object.values(GAME_EVENTS).forEach(e => eventBus.removeAll(e));

      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: 'min(90vh, 860px)',
        aspectRatio: '3 / 4',
        margin: '0 auto',
      }}
    />
  );
}
