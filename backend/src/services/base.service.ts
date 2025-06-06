import { ZodType } from 'zod';
import mongoose from 'mongoose';
import { BaseEntity, CrudOperations } from '../db/base.store';

type CreateType<T extends BaseEntity> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>;

abstract class BaseService<T extends BaseEntity> {
    protected repository: CrudOperations<T>;
    protected createSchema: ZodType<CreateType<T>>;
    protected updateSchema: ZodType<Partial<CreateType<T>>>;
  
    constructor(
      repository: CrudOperations<T>,
      createSchema: ZodType<CreateType<T>>,
      updateSchema: ZodType<Partial<CreateType<T>>>
    ) {
      this.repository = repository;
      this.createSchema = createSchema;
      this.updateSchema = updateSchema;
    }
  
    async create(data: unknown): Promise<T> {
      const validatedData = this.createSchema.parse(data);
      return await this.repository.create(validatedData);
    }
  
    async getById(id: string): Promise<T> {
      this.validateId(id);
      const entity = await this.repository.findById(id);
      if (!entity) {
        throw new Error(`Entity with id ${id} not found`);
      }
      return entity;
    }
  
    async getAll(filter?: Partial<T>): Promise<T[]> {
      return await this.repository.findAll(filter);
    }
  
    async update(id: string, data: unknown): Promise<T> {
      this.validateId(id);
      const validatedData = this.updateSchema.parse(data);
      const updateFields = validatedData as Partial<T>;
      const updated = await this.repository.update(id, updateFields);
      if (!updated) {
        throw new Error(`Entity with id ${id} not found`);
      }
      return updated;
    }
  
    async delete(id: string): Promise<void> {
      this.validateId(id);
      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new Error(`Entity with id ${id} not found`);
      }
    }
  
    protected validateId(id: string): void {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }
    }
}

export default BaseService;