import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import BaseService from '../services/base.service';
import { BaseEntity } from '../db/base.store';

abstract class BaseController<T extends BaseEntity> {
    protected service: BaseService<T>;
    protected router: express.Router;
  
    constructor(service: BaseService<T>) {
      this.service = service;
      this.router = express.Router();
      this.initializeRoutes();
    }
  
    protected initializeRoutes(): void {
      this.router.post('/', this.handleCreate.bind(this));
      this.router.get('/', this.handleGetAll.bind(this));
      this.router.get('/:id', this.handleGetById.bind(this));
      this.router.put('/:id', this.handleUpdate.bind(this));
      this.router.delete('/:id', this.handleDelete.bind(this));
    }
  
    protected async handleCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const entity = await this.service.create(req.body);
        res.status(201).json({
          success: true,
          data: entity,
          message: 'Entity created successfully'
        });
      } catch (error) {
        next(error);
      }
    }
  
    protected async handleGetAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const entities = await this.service.getAll(req.query as Partial<T>);
        res.status(200).json({
          success: true,
          data: entities,
          count: entities.length
        });
      } catch (error) {
        next(error);
      }
    }
  
    protected async handleGetById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const entity = await this.service.getById(req.params.id);
        res.status(200).json({
          success: true,
          data: entity
        });
      } catch (error) {
        next(error);
      }
    }
  
    protected async handleUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const entity = await this.service.update(req.params.id, req.body);
        res.status(200).json({
          success: true,
          data: entity,
          message: 'Entity updated successfully'
        });
      } catch (error) {
        next(error);
      }
    }
  
    protected async handleDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        await this.service.delete(req.params.id);
        res.status(200).json({
          success: true,
          message: 'Entity deleted successfully'
        });
      } catch (error) {
        next(error);
      }
    }
  
    getRouter(): express.Router {
      return this.router;
    }
  }
  
  // Error handling middleware
  export const errorHandler = (
    error: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction
  ): void => {
    console.error('Error:', error);
  
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
  
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }
  
    if (error.message.includes('Invalid ID format')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
  
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  };

  export default BaseController;