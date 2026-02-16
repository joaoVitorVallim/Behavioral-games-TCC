import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Match } from '../match/match.entity';
import { Session } from '../session/session.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column()
  course: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  profession: string;

  @ManyToOne(() => Session, (session) => session.players, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ nullable: false })
  session_id: string;

  @OneToMany(() => Match, (match) => match.player1)
  matchesAsPlayer1: Match[];

  @OneToMany(() => Match, (match) => match.player2)
  matchesAsPlayer2: Match[];

  @CreateDateColumn()
  createdAt: Date;
}
