import { Request, Response, NextFunction, Router } from 'express';
import { verifyToken } from '../utils/auth';
import { AuthRequest } from '../types/auth';
import { BaseEntity } from '../db/base.store';
import { Types, Document } from 'mongoose';
import { UserSpecificBaseService } from '../services/userSpecificBase.service';

export abstract class CrudController<
    TView extends BaseEntity,
    TDoc extends Document & { user: Types.ObjectId },
    TCreate extends Omit<TView, '_id' | 'createdAt' | 'updatedAt' | 'user'>,
    TUpdate extends Partial<TCreate>
> {
    protected service: UserSpecificBaseService<TView, TDoc, TCreate, TUpdate>;
    protected router: Router;
    protected modelName: string;

    constructor(service: UserSpecificBaseService<TView, TDoc, TCreate, TUpdate>, modelName: string) {
        this.service = service;
        this.modelName = modelName;
        this.router = Router();
        this.initializeRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

    protected initializeRoutes(): void {
        this.router.use(verifyToken);
        this.router.post('/', this.create.bind(this));
        this.router.get('/', this.getAll.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.put('/:id', this.update.bind(this));
        this.router.delete('/:id', this.delete.bind(this));
    }

    protected toViewModel(doc: TDoc): TView;
    protected toViewModel(doc: TDoc | null): TView | null;
    protected toViewModel(doc: TDoc | null): TView | null {
        if (!doc) return null;

        const plain = doc.toObject ? doc.toObject() : doc;
        return {
            ...plain,
            _id: plain._id?.toString(),
        } as TView;
    }

    protected async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const newItem = await this.service.create(req.body, req.user._id);
            res.status(201).json({
                success: true,
                data: this.toViewModel(newItem),
                message: `${this.modelName} created successfully`,
            });
        } catch (error) {
            next(error);
        }
    }

    protected async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const items = await this.service.getAll(req.user._id);
            const viewModels = items.map(item => this.toViewModel(item));
            res.status(200).json({
                success: true,
                data: viewModels,
                count: viewModels.length,
            });
        } catch (error) {
            next(error);
        }
    }

    protected async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const item = await this.service.getById(req.params.id, req.user._id);
            res.status(200).json({
                success: true,
                data: this.toViewModel(item),
            });
        } catch (error) {
            next(error);
        }
    }

    protected async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const updatedItem = await this.service.update(req.params.id, req.body, req.user._id);
            res.status(200).json({
                success: true,
                data: this.toViewModel(updatedItem),
                message: `${this.modelName} updated successfully`,
            });
        } catch (error) {
            next(error);
        }
    }

    protected async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.service.delete(req.params.id, req.user._id);
            res.status(200).json({
                success: true,
                message: `${this.modelName} deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    }
} 