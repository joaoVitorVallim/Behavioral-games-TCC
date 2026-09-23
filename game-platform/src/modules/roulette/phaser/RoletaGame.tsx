import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { RoletaScene, SIZES, orientationFor, type RoletaHandlers, type TrialRecord } from './RoletaScene';
import type { RouletteGameState } from '../types/roulette';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&family=Montserrat:wght@500;600;700&display=swap';

async function loadFonts() {
  if (!document.querySelector(`link[href="${FONTS_HREF}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }
  // O canvas não re-renderiza texto quando a fonte chega: espere antes de criar o jogo.
  await Promise.all(
    ['600 20px Inter', '700 20px Montserrat', '600 20px "JetBrains Mono"'].map(f =>
      document.fonts.load(f).catch(() => null),
    ),
  );
}

type Props = RoletaHandlers & {
  /** Estado da partida já resolvido pelo join — a cena parte dele e passa a mandar via onSpin/onFinish. */
  initial: RouletteGameState;
  /** Persistência de cada ensaio (opcional). */
  onTrial?: (t: TrialRecord) => void;
};

export default function RoletaGame({ initial, onSpin, onFinish, onExit, onTrial }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onTrialRef = useRef(onTrial);
  const onSpinRef = useRef(onSpin);
  const onFinishRef = useRef(onFinish);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onTrialRef.current = onTrial;
    onSpinRef.current = onSpin;
    onFinishRef.current = onFinish;
    onExitRef.current = onExit;
  }, [onTrial, onSpin, onFinish, onExit]);

  useEffect(() => {
    let game: Phaser.Game | null = null;
    let cancelled = false;
    let orient = orientationFor(window.innerWidth, window.innerHeight);

    const onResize = () => {
      const next = orientationFor(window.innerWidth, window.innerHeight);
      if (!game || next === orient) return;
      orient = next;
      (game.scene.getScene('roleta') as RoletaScene).requestLayout(SIZES[next]);
    };

    loadFonts().then(() => {
      if (cancelled || !hostRef.current) return;
      const scene = new RoletaScene();
      scene.initial = initial;
      scene.onTrial = t => onTrialRef.current?.(t);
      scene.onSpin = (opcao, aposta) => onSpinRef.current(opcao, aposta);
      scene.onFinish = () => onFinishRef.current();
      scene.onExit = () => onExitRef.current();
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        backgroundColor: '#08121d',
        antialias: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: SIZES[orient].w,
          height: SIZES[orient].h,
        },
        scene: [scene],
      });
      window.addEventListener('resize', onResize);
    });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      game?.destroy(true);
    };
  }, [initial]);

  return (
    <div
      ref={hostRef}
      style={{
        width: '100vw',
        height: '100dvh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: '#08121d',
      }}
    />
  );
}
