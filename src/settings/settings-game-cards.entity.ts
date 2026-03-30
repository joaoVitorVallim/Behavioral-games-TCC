import { ChildEntity, Column } from 'typeorm';
import { Settings } from './settings.entity';

@ChildEntity()
export class SettingsGameCards extends Settings {
  @Column({ type: 'boolean', default: false, nullable: true })
  userViewPoints: boolean;

  @Column({ type: 'int', default: 10, nullable: true })
  limitRounds: number;
}
