import { ChildEntity, Column } from 'typeorm';
import { Settings } from './settings.entity';

@ChildEntity()
export class SettingsGameWords extends Settings {
  @Column({ type: 'int', default: 100, nullable: true })
  wordPoolSize: number;

  @Column({ type: 'varchar', length: 50, default: 'medium', nullable: true })
  difficulty: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  includeTimerPerWord: boolean;

  @Column({ type: 'int', default: 30, nullable: true })
  secondsPerWord: number;
}
