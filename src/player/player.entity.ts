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
  apelido?: string;

  @Column({ length: 100, nullable: true })
  curso?: string;

  @Column({ type: 'int', nullable: true })
  idade?: number;

  @Column({ length: 1, nullable: true })
  genero?: string;

  @Column({ length: 255, nullable: true })
  profissao?: string;

  @ManyToOne(() => Session, (session) => session.players, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ nullable: false })
  session_id: string;

  @CreateDateColumn()
  created_at: Date;
}
