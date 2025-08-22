import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.format(),
        });
      }
      req.body = parsed.data; 
      next();
    } catch (error: any) {
      return res.status(400).json({ error: error.errors });
    }
  };
