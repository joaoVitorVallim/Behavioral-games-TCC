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

    // If array is empty it is valid
    if (value.length === 0) {
      return true;
    }

    // Check if all elements are strings
    if (!value.every((item) => typeof item === 'string')) {
      return false;
    }

    // Check if all elements are valid fields
    return value.every((field) => isValidPlayerField(field));
  }

  defaultMessage(args: ValidationArguments) {
    const invalidFields = (args.value || []).filter(
      (field) => !isValidPlayerField(field),
    );

    if ((args.value || []).some((item) => typeof item !== 'string')) {
      return 'inputInfo must contain only strings';
    }

    return `Invalid fields in inputInfo: [${invalidFields.join(', ')}]. Valid fields are: [${PLAYER_OPTIONAL_FIELDS.join(', ')}]`;
  }
}

/**
 * Decorator to validate inputInfo
 * Ensures only valid optional Player fields are included
 *
 * @example
 * ```ts
 * @IsValidInputInfos()
 * inputInfo?: string[];
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
