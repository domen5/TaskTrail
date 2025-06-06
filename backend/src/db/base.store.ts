import { Document, Model } from 'mongoose';

export interface BaseEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CrudOperations<T> {
  create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

abstract class BaseRepository<T extends BaseEntity & Document> implements CrudOperations<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const entity = new this.model(data);
    return await entity.save();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findAll(filter: Partial<T> = {}): Promise<T[]> {
    return await this.model.find(filter as any).exec();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { ...data, updatedAt: new Date() }, 
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findByQuery(query: any): Promise<T[]> {
    return await this.model.find(query).exec();
  }

  async count(filter: Partial<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter as any).exec();
  }
}

export default BaseRepository;