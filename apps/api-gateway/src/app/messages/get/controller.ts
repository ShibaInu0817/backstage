import { Controller, Get, Logger, Param } from '@nestjs/common';
import { GetMessageUseCase } from './use-case';

@Controller({ path: 'message', version: ['1'] })
export class GetMessageController {
  private readonly logger = new Logger(GetMessageController.name);
  constructor(private readonly getMessageUseCase: GetMessageUseCase) {}

  @Get(':id')
  async getData(@Param('id') id: string) {
    this.logger.debug(`Getting message with id ${id}`);
    const result = await this.getMessageUseCase.execute({ id });

    return result;
  }
}
