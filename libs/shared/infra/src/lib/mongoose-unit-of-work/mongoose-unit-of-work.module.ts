import { Module, Scope } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UNIT_OF_WORK_TOKEN } from '@boilerplate/domain';
import { MongooseUnitOfWork } from './mongoose-unit-of-work';

/**
 * Mongoose-specific Unit of Work module.
 *
 * This module provides a MongoDB/Mongoose implementation of the IUnitOfWork interface.
 * It configures the UoW with REQUEST scope to ensure transaction isolation
 * between concurrent HTTP requests.
 *
 * For other database implementations (PostgreSQL, etc.), create separate modules
 * like PostgresUnitOfWorkModule that also provide UNIT_OF_WORK_TOKEN.
 */
@Module({
  imports: [MongooseModule],
  providers: [
    {
      provide: UNIT_OF_WORK_TOKEN,
      useClass: MongooseUnitOfWork,
      scope: Scope.REQUEST,
    },
  ],
  exports: [UNIT_OF_WORK_TOKEN],
})
export class MongooseUnitOfWorkModule {}
