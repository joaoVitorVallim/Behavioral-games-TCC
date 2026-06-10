import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from '../session/session.entity';
import { EducationLevel } from './education-level.enum';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EducationLevel,
    nullable: true,
  })
  educationLevel?: EducationLevel;

  @Column({ type: 'int', nullable: true })
  semester?: number;

  @Column({ length: 100, nullable: true })
  course?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ length: 50, nullable: true })
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
