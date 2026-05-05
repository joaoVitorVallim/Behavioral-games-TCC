import { ChildEntity, Column } from 'typeorm';
import { Settings } from './settings.entity';

@ChildEntity()
export class SettingsGamePrisoner extends Settings {
  @Column({ type: 'boolean', default: false, nullable: true })
  userViewPoints!: boolean;

  @Column({ name: 'limitrounds', type: 'int', default: 10, nullable: true })
  limitRounds!: number;

  @Column({ name: 'roundtimelimit', type: 'int', default: null, nullable: true })
  roundTimeLimit!: number | null;
}
