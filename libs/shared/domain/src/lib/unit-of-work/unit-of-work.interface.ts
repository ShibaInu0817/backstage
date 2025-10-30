/**
 * Unit of Work interface for managing transactional boundaries
 * in a database-agnostic way.
 *
 * This interface follows DDD principles by keeping the domain layer
 * free from infrastructure concerns (like specific database clients).
 * Reason: Different databases have different ways of managing transactions, and we want to keep the domain layer free from these details.
 */
export interface IUnitOfWork {
  /**
   * Executes work within a transaction.
   * Automatically commits on success, rolls back on error.
   *
   * @param work - A function containing the transactional work
   * @returns The result of the work function
   * @throws If the transaction fails or work throws an error
   */
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;

  /**
   * Manually starts a new transaction.
   * Use this for advanced scenarios where you need explicit control.
   *
   * @throws If a transaction is already active
   */
  start(): Promise<void>;

  /**
   * Commits the current transaction.
   * Use this when manually managing transactions with start().
   *
   * @throws If no transaction is active
   */
  commit(): Promise<void>;

  /**
   * Rolls back the current transaction.
   * Use this when manually managing transactions with start().
   *
   * @throws If no transaction is active
   */
  rollback(): Promise<void>;
}

/**
 * Dependency Injection token for IUnitOfWork
 */
export const UNIT_OF_WORK_TOKEN = 'IUnitOfWork';
