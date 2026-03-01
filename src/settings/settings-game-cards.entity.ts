import { ChildEntity, Column } from 'typeorm';
import { Settings } from './settings.entity';

@ChildEntity()
export class SettingsGameCards extends Settings {
  @Column({ type: 'int', default: 52, nullable: true })
  cardDeckSize: number;

  @Column({ type: 'boolean', default: true, nullable: true })
  allowSpecialCards: boolean;

  @Column({ type: 'varchar', length: 100, default: 'standard', nullable: true })
  cardTheme: string;
}
