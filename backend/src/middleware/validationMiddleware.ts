import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((error) => ({
    field: 'path' in error ? error.path : undefined,
    message: error.msg,
    type: error.type,
  }));

  return res.status(400).json({
    success: false,
    message: 'Validierung fehlgeschlagen',
    errors: formattedErrors,
  });
};
