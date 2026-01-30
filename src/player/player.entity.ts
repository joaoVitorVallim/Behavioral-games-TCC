import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Match } from '../match/match.entity';

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

  @OneToMany(() => Match, (match) => match.player1)
  matchesAsPlayer1: Match[];

  @OneToMany(() => Match, (match) => match.player2)
  matchesAsPlayer2: Match[];

  @CreateDateColumn()
  createdAt: Date;
}
