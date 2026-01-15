import { DomainError } from './base-domain-error';

export class OptimisticLockError extends DomainError {
  readonly code = 'OPTIMISTIC_LOCK_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'OptimisticLockError';
  }
}
