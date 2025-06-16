import mongoose, { Document, Types } from 'mongoose';
import { ZodType } from 'zod';
import { BaseEntity, UserSpecificStore } from '../db/base.store';
import { InputError } from '../utils/errors';


export abstract class UserSpecificBaseService<
    TView extends BaseEntity,
    TDoc extends Document & { user: Types.ObjectId },
    TCreate extends Omit<TView, '_id' | 'createdAt' | 'updatedAt' | 'user'>,
    TUpdate extends Partial<TCreate>
> {
    protected store: UserSpecificStore<TDoc>;
    protected createSchema: ZodType<TCreate>;
    protected updateSchema: ZodType<TUpdate>;

    constructor(
        store: UserSpecificStore<TDoc>,
        createSchema: ZodType<TCreate>,
        updateSchema: ZodType<TUpdate>
    ) {
        this.store = store;
        this.createSchema = createSchema;
        this.updateSchema = updateSchema;
    }

    async create(data: unknown, userId: string | Types.ObjectId): Promise<TDoc> {
        const validatedData = this.createSchema.parse(data);
        const dataToSave = { ...validatedData, user: new Types.ObjectId(userId) };
        return await this.store.create(dataToSave as any);
    }

    async getById(id: string, userId: string | Types.ObjectId): Promise<TDoc> {
        this.validateId(id);
        const entity = await this.store.findByIdAndUser(id, new Types.ObjectId(userId));
        if (!entity) {
            throw new InputError(`Entity with id ${id} not found`);
        }
        return entity;
    }

    async getAll(userId: string | Types.ObjectId): Promise<TDoc[]> {
        return await this.store.findByUser(new Types.ObjectId(userId));
    }

    async update(id: string, data: unknown, userId: string | Types.ObjectId): Promise<TDoc> {
        this.validateId(id);
        const validatedData = this.updateSchema.parse(data);
        const updated = await this.store.updateByIdAndUser(id, validatedData as unknown as Partial<TDoc>, new Types.ObjectId(userId));
        if (!updated) {
            throw new InputError(`Entity with id ${id} not found`);
        }
        return updated;
    }

    async delete(id: string, userId: string | Types.ObjectId): Promise<boolean> {
        this.validateId(id);
        return await this.store.deleteByIdAndUser(id, new Types.ObjectId(userId));
    }

    protected validateId(id: string): void {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new InputError('Invalid ID format');
        }
    }
} 