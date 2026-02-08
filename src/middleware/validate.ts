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
        req.query = (await validators.query.parseAsync(req.query)) as any;
      }
      if (validators.params) {
        req.params = (await validators.params.parseAsync(req.params)) as any;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
