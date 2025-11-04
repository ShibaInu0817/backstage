import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class CommandMiddleware implements OnModuleInit {
  private readonly logger = new Logger(CommandMiddleware.name);
  private readonly isEnabled: boolean;

  constructor(private readonly commandBus: CommandBus) {
    this.isEnabled = this.isDebugEnabled();
  }

  onModuleInit() {
    const originalExecute = this.commandBus.execute.bind(this.commandBus);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.commandBus.execute = async (command: any) => {
      this.logCommand(command);
      return originalExecute(command);
    };
  }

  private isDebugEnabled(): boolean {
    const envValue = process.env['DEBUG_LOG_ENABLED'];
    return envValue === 'true' || envValue === '1';
  }

  private logCommand(command: unknown): void {
    if (!this.isEnabled || !command) return;

    const commandName = command.constructor?.name ?? 'UnknownCommand';

    try {
      this.logger.debug(`Executing command: ${commandName}`, command);
    } catch (error) {
      this.logger.warn(`Failed to log command: ${commandName}`, error);
    }
  }
}
