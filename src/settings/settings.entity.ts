import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ChildEntity,
  TableInheritance,
} from 'typeorm';
import { GameType } from '../game/games.enum';
import { Session } from '../session/session.entity';

@Entity('settings')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  configName: string;

  @Column({ type: 'enum', enum: GameType, nullable: false })
  game: GameType;

  @Column({ type: 'simple-array', nullable: true })
  inputInfo: string[];
 
  @Column({ type: 'boolean', default: false })
  userViewPoints: boolean;

  @Column({ type: 'int', nullable: false })
  limitRounds: number;

  @OneToMany(() => Session, (session) => session.settings)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;
}
