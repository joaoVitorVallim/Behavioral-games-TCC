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

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, (session) => session.matches, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ nullable: false })
  session_id: string;

  @ManyToOne(() => Player, (player) => player.matchesAsPlayer1, { nullable: false })
  @JoinColumn({ name: 'player1_id' })
  player1: Player;

  @Column({ nullable: false })
  player1_id: string;

  @ManyToOne(() => Player, (player) => player.matchesAsPlayer2, { nullable: false })
  @JoinColumn({ name: 'player2_id' })
  player2: Player;

  @Column({ nullable: false })
  player2_id: string;

  @Column({ type: 'json', nullable: true })
  moves: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  matchTime: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.WAITING,
  })
  status: MatchStatus;

  @CreateDateColumn()
  createdAt: Date;
}
