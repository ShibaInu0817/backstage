export interface BaseEntityProps {
  id: string;
  metadata?: Record<string, any>;
  version: number;
}

export abstract class BaseEntity {
  readonly id: string;
  metadata?: Record<string, any>;
  readonly version: number;

  constructor(props: BaseEntityProps) {
    this.id = props.id;
    this.metadata = props.metadata;
    this.version = props.version;
  }
}
