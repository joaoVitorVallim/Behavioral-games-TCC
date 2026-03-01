import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from '../session/session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ length: 100, unique: true, nullable: false })
  login: string;

  @Column({ nullable: false })
  password_hash: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @CreateDateColumn()
  created_at: Date;
}
