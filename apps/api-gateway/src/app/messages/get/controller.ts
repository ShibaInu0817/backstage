import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { GetMessageUseCase } from './use-case';
import { MessageNotFoundError } from '@boilerplate/messages-domain';

@Controller({ path: 'message', version: ['1'] })
export class GetMessageController {
  private readonly logger = new Logger(GetMessageController.name);
  constructor(private readonly getMessageUseCase: GetMessageUseCase) {}

  @Get(':id')
  async getData(@Param('id') id: string) {
    this.logger.debug(`Getting message with id ${id}`);
    const result = await this.getMessageUseCase.execute({ id });

    if (!result.ok) {
      if (result.error instanceof MessageNotFoundError) {
        throw new NotFoundException('Message not found');
      }
      throw result.error;
    }

    return {
      ok: true,
      data: {
        message: result.value,
      },
    };
  }
}
