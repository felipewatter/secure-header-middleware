import { Request, Response, NextFunction } from 'express';
import { SecureHeaderOptions } from './types';

export default function secureHeaders(options?: SecureHeaderOptions) {
  return function (req: Request, res: Response, next: NextFunction) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');

    if (options?.contentSecurityPolicy) {
      res.setHeader('Content-Security-Policy', options.contentSecurityPolicy);
    }

    next();
  };
}