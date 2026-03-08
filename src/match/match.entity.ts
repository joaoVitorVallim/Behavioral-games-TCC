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
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export interface Move {
  player: number; // 1 or 2
  action: Record<string, any>; // JSON with game-specific action
  timestamp: Date;
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ nullable: false })
  session_id: string;

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
  moves?: Move[];

  @Column({ type: 'int', nullable: true })
  matchTimeSeconds?: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.WAITING,
  })
  status: MatchStatus;

  @CreateDateColumn()
  created_at: Date;
}
