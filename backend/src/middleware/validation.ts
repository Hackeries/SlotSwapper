import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    next();
  };
};

export const schemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  createEvent: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
    status: Joi.string().valid('BUSY', 'SWAPPABLE').optional()
  }),
  
  updateEvent: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    start_time: Joi.date().iso().optional(),
    end_time: Joi.date().iso().optional(),
    status: Joi.string().valid('BUSY', 'SWAPPABLE', 'SWAP_PENDING').optional()
  }),
  
  swapRequest: Joi.object({
    mySlotId: Joi.number().integer().positive().required(),
    theirSlotId: Joi.number().integer().positive().required()
  }),
  
  swapResponse: Joi.object({
    accepted: Joi.boolean().required()
  })
};
