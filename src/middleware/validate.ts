import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

interface RequestValidators {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}

export const validate =
  (validators: RequestValidators) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body);
      }
      if (validators.query) {
        // Express 5: req.query is a read-only getter, so validate without reassigning
        await validators.query.parseAsync(req.query);
      }
      if (validators.params) {
        // Express 5: req.params may also be read-only in some cases
        await validators.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
