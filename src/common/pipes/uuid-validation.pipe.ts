import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class UuidValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {

    if (metadata.type === 'param' && metadata.data === 'id') {
      if (!isUUID(value)) {
        throw new BadRequestException('Invalid UUID');
      }
    }

    return value;
  }
}