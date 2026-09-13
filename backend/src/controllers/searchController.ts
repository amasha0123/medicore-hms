import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/searchService';
import { ApiResponse } from '../utils/apiResponse';

export class SearchController {
  public static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q || req.query.query || '') as string;
      const results = await SearchService.globalSearch(query);
      return ApiResponse.success(res, 'Universal search completed', results);
    } catch (err) {
      next(err);
    }
  }
}
