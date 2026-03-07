import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from '../session/session.entity';
import { Player } from '../player/player.entity';

export enum MatchStatus {
  AGUARDANDO = 'aguardando',
  EM_PARTIDA = 'em_partida',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
}

export interface Jogada {
  jogador: number; // 1 ou 2
  acao: Record<string, any>; // JSON com ação específica do jogo
  timestamp: Date;
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, { nullable: false })
  @JoinColumn({ name: 'sessao_id' })
  sessao: Session;

  @Column({ nullable: false })
  sessao_id: string;

  @ManyToOne(() => Player, { nullable: false })
  @JoinColumn({ name: 'player1_id' })
  player1: Player;

  @Column({ nullable: false })
  player1_id: string;

  @ManyToOne(() => Player, { nullable: false })
  @JoinColumn({ name: 'player2_id' })
  player2: Player;

  @Column({ nullable: false })
  player2_id: string;

  @Column({ type: 'jsonb', nullable: true })
  jogadas?: Jogada[];

  @Column({ type: 'int', nullable: true })
  tempoPartidaSegundos?: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.AGUARDANDO,
  })
  status: MatchStatus;

  @CreateDateColumn()
  created_at: Date;
}
