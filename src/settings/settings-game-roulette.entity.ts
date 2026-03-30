import { ChildEntity, Column } from 'typeorm';
import { Settings } from './settings.entity';

export interface RoulettePopupConfig {
  message: string;
  players: number;
}

@ChildEntity()
export class SettingsGameRoulette extends Settings {
  @Column({ name: 'timelimit', type: 'int', default: 60, nullable: true })
  timeLimit: number;

  @Column({ name: 'pointslimit', type: 'int', default: 500, nullable: true })
  pointsLimit: number;

  @Column({ type: 'json', nullable: true })
  popup: RoulettePopupConfig | null;

  @Column({ name: 'initmoney', type: 'int', default: 1000, nullable: true })
  initMoney: number;
}
