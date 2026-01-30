import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from '../session/session.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @OneToMany(() => Session, (session) => session.game)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;
}
