import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  RouletteMoveOption,
  MatchMoves,
  RoundMove,
  PrisonerRoundMove,
  RouletteRoundMove,
} from '../match.entity';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPrisonerRoundMove(value: unknown): value is PrisonerRoundMove {
  if (!isPlainObject(value)) return false;
  const validChoices = ['cooperate', 'defect'];
  return (
    validChoices.includes(value.player1Choice as string) &&
    validChoices.includes(value.player2Choice as string) &&
    typeof value.player1Points === 'number' &&
    typeof value.player2Points === 'number'
  );
}

function isRouletteRoundMove(value: unknown): value is RouletteRoundMove {
  if (!isPlainObject(value)) return false;
  return (
    typeof value.coinsAmount === 'number' &&
    typeof value.aposta === 'number' &&
    Object.values(RouletteMoveOption).includes(value.opcao as RouletteMoveOption) &&
    typeof value.winrate === 'boolean'
  );
}

function isValidRoundMove(value: unknown): value is RoundMove {
  return isPrisonerRoundMove(value) || isRouletteRoundMove(value);
}

@ValidatorConstraint({ name: 'isMovesByRound', async: false })
export class IsMovesByRoundConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): value is MatchMoves {
    if (!isPlainObject(value)) return false;

    const entries = Object.entries(value);
    if (entries.length === 0) return true;

    return entries.every(([round, move]) => /^\d+$/.test(round) && isValidRoundMove(move));
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be an object with numeric keys ("1", "2", ...) and each round must follow prisoner or roulette schema`;
  }
}

export function IsMovesByRound(options?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsMovesByRoundConstraint,
    });
  };
}
