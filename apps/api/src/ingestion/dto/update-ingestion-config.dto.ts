import { PartialType } from '@nestjs/mapped-types';
import { CreateIngestionConfigDto } from './create-ingestion-config.dto';

export class UpdateIngestionConfigDto extends PartialType(CreateIngestionConfigDto) {}
