import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from '../session/session.entity';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  configName: string;

  @Column({ type: 'json', nullable: false })
  parameters: Record<string, any>;

  @OneToMany(() => Session, (session) => session.settings)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;
}
