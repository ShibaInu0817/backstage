import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMessageQuery } from '@boilerplate/messages-application';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('message')
@Controller({ path: 'message', version: ['1'] })
export class GetMessageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getData(@Param('id') id: string) {
    const query = new GetMessageQuery(id);
    const message = await this.queryBus.execute(query);

    return message;
  }
}
