import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ChildEntity,
  TableInheritance,
} from 'typeorm';
import { Game } from '../game/game.entity';
import { Session } from '../session/session.entity';

@Entity('settings')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  configName: string;

  @ManyToOne(() => Game, { nullable: false })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ nullable: false })
  game_id: string;

  @Column({ type: 'simple-array', nullable: true })
  inputInfos: string[];

  @Column({ type: 'boolean', default: false })
  userViewPoints: boolean;

  @Column({ type: 'int', nullable: false })
  limitRounds: number;

  @OneToMany(() => Session, (session) => session.settings)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;
}
