import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import { IUnitOfWork } from '@boilerplate/domain';

/**
 * Mongoose implementation of the Unit of Work pattern.
 *
 * This class manages MongoDB transactions using Mongoose sessions.
 * It implements the domain-level IUnitOfWork interface while handling
 * Mongoose-specific details internally.
 *
 * Scope: REQUEST - Each HTTP request gets its own instance to prevent
 * transaction cross-contamination between concurrent requests.
 */
@Injectable()
export class MongooseUnitOfWork implements IUnitOfWork {
  private session: ClientSession | null = null;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Get the current Mongoose session.
   * This method is infrastructure-specific and should only be used
   * by repository implementations to access the underlying session.
   *
   * @returns The active ClientSession or undefined if no transaction is active
   */
  getSession(): ClientSession | undefined {
    return this.session ?? undefined;
  }

  /**
   * Executes work within a MongoDB transaction.
   * Automatically handles session creation, transaction management,
   * and cleanup.
   *
   * @param work - Function containing the transactional operations
   * @returns The result of the work function
   * @throws If transaction fails or work function throws
   */
  async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();

    try {
      let result: T;

      await session.withTransaction(async () => {
        this.session = session;
        result = await work();
      });

      return result!;
    } finally {
      // Clean up session reference and end the session
      this.session = null;
      await session.endSession();
    }
  }

  /**
   * Manually starts a new transaction.
   * For advanced scenarios requiring explicit transaction control.
   *
   * @throws Error if a transaction is already active
   */
  async start(): Promise<void> {
    if (this.session) {
      throw new Error(
        'Transaction already started. Cannot start a new transaction.'
      );
    }

    this.session = await this.connection.startSession();
    this.session.startTransaction();
  }

  /**
   * Commits the current transaction.
   *
   * @throws Error if no transaction is active
   */
  async commit(): Promise<void> {
    if (!this.session) {
      throw new Error('No active transaction to commit.');
    }

    try {
      await this.session.commitTransaction();
    } finally {
      await this.session.endSession();
      this.session = null;
    }
  }

  /**
   * Rolls back the current transaction.
   *
   * @throws Error if no transaction is active
   */
  async rollback(): Promise<void> {
    if (!this.session) {
      throw new Error('No active transaction to rollback.');
    }

    try {
      await this.session.abortTransaction();
    } finally {
      await this.session.endSession();
      this.session = null;
    }
  }
}
