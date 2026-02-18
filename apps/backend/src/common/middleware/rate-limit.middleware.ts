import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../../modules/cache/services/cache.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private cacheService: CacheService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || 'unknown';
    const key = `rate-limit:${ip}`;
    const limit = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
    const windowSeconds = parseInt(process.env.RATE_LIMIT_TTL || '60', 10);

    try {
      const allowed = await this.cacheService.checkRateLimit(key, limit, windowSeconds);

      if (!allowed) {
        throw new HttpException('Too many requests, please try again later', HttpStatus.TOO_MANY_REQUESTS);
      }

      const count = (await this.cacheService.get<number>(key)) || 0;
      const remaining = limit - count + 1 || 0;
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));

      next();
    } catch (error) {
      next(error);
    }
  }
}
