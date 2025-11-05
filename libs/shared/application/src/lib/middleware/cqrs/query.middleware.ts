import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

@Injectable()
export class QueryMiddleware implements OnModuleInit {
  private readonly logger = new Logger(QueryMiddleware.name);
  private readonly isEnabled: boolean;

  constructor(private readonly queryBus: QueryBus) {
    this.isEnabled = this.isDebugEnabled();
  }

  onModuleInit() {
    const originalExecute = this.queryBus.execute.bind(this.queryBus);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.queryBus.execute = async (query: any) => {
      this.logQuery(query);
      return originalExecute(query);
    };
  }

  private isDebugEnabled(): boolean {
    const envValue = process.env['DEBUG_LOG_ENABLED'];
    return envValue === 'true' || envValue === '1';
  }

  private logQuery(query: unknown): void {
    if (!this.isEnabled || !query) return;

    const queryName = query.constructor?.name ?? 'UnknownQuery';

    try {
      this.logger.debug(`Executing query: ${queryName}`, query);
    } catch (error) {
      this.logger.warn(`Failed to log query: ${queryName}`, error);
    }
  }
}
