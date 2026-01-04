import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'The updated content of the message',
    example: 'Updated Hello, world!',
  })
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'The metadata of the message',
    example: { key: 'updated_value' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
