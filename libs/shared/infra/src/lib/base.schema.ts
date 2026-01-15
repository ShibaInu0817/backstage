import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export abstract class BaseDo {
  _id!: mongoose.Types.ObjectId;

  get id(): string {
    return this._id.toString();
  }
  set id(value: string) {
    this._id = new mongoose.Types.ObjectId(value);
  }

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ required: true, type: Number, default: 1 })
  version!: number;
}
