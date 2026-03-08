import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  PLAYER_OPTIONAL_FIELDS,
  isValidPlayerField,
} from '../constants/player-fields.constants';

@ValidatorConstraint({ name: 'isValidInputInfos', async: false })
export class IsValidInputInfosConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    if (!Array.isArray(value)) {
      return false;
    }

    // Se array vazio é válido
    if (value.length === 0) {
      return true;
    }

    // Verifica se todos os elementos são strings
    if (!value.every((item) => typeof item === 'string')) {
      return false;
    }

    // Verifica se todos os elementos são campos válidos
    return value.every((field) => isValidPlayerField(field));
  }

  defaultMessage(args: ValidationArguments) {
    const invalidFields = (args.value || []).filter(
      (field) => !isValidPlayerField(field),
    );

    if ((args.value || []).some((item) => typeof item !== 'string')) {
      return 'inputInfos deve conter apenas strings';
    }

    return `Campos inválidos em inputInfos: [${invalidFields.join(', ')}]. Campos válidos são: [${PLAYER_OPTIONAL_FIELDS.join(', ')}]`;
  }
}

/**
 * Decorator para validar inputInfos
 * Garante que apenas campos opcionais válidos do Player sejam incluídos
 *
 * @example
 * ```ts
 * @IsValidInputInfos()
 * inputInfos?: string[];
 * ```
 */
export function IsValidInputInfos(options?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [],
      validator: IsValidInputInfosConstraint,
    });
  };
}
