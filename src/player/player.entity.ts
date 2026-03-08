import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Session } from '../session/session.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  nickname?: string;

  @Column({ length: 100, nullable: true })
  course?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ length: 1, nullable: true })
  gender?: string;

  @Column({ length: 255, nullable: true })
  profession?: string;

  @ManyToOne(() => Session, (session) => session.players, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ nullable: false })
  session_id: string;

  @CreateDateColumn()
  created_at: Date;
}
