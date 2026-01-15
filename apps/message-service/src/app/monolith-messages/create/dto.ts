import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'The sender id', example: '123' })
  @IsNotEmpty()
  senderId!: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, world!',
  })
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ description: 'The tenant id', example: '123' })
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ description: 'The conversation id', example: '123' })
  @IsNotEmpty()
  conversationId!: string;

  @ApiProperty({
    description: 'The metadata of the message',
    example: { key: 'value' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
