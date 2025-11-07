import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from '@boilerplate/messages-domain';

export class ListMessagesQueryDto {
  @ApiProperty({
    description: 'The conversation id to filter messages',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  conversationId!: string;

  @ApiPropertyOptional({
    description: 'The tenant id to filter messages',
    example: '123',
  })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'The sender id to filter messages',
    example: 'user123',
  })
  @IsOptional()
  @IsString()
  senderId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering messages (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering messages (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search text to filter messages by content',
    example: 'hello world',
  })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiPropertyOptional({
    description: 'Cursor for pagination (base64 encoded)',
    example: 'eyJ0aW1lc3RhbXAiOjE2OTc...',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of items to return',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'timestamp',
    default: 'timestamp',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
