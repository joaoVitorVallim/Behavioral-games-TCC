import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Game } from '../game/game.entity';
import { Settings } from '../settings/settings.entity';
import { User } from '../users/user.entity';
import { Match } from '../match/match.entity';
import { randomBytes } from 'crypto';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game, (game) => game.sessions, { nullable: false })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ nullable: false })
  game_id: string;

  @ManyToOne(() => Settings, (settings) => settings.sessions, { nullable: false })
  @JoinColumn({ name: 'settings_id' })
  settings: Settings;

  @Column({ nullable: false })
  settings_id: string;

  @ManyToOne(() => User, (user) => user.sessions, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: false })
  user_id: string;

  @Column({ unique: true, length: 6 })
  inviteCode: string;

  @Column({ nullable: false })
  roundsLimit: number;

  @OneToMany(() => Match, (match) => match.session)
  matches: Match[];

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  generateCode() {
    this.inviteCode = randomBytes(3).toString('hex').toUpperCase();
  }
}


