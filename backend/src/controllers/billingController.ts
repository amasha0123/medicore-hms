import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billingService';
import { ApiResponse } from '../utils/apiResponse';

export class BillingController {
  public static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await BillingService.getInvoices(req.query as any);
      return ApiResponse.success(res, 'Invoices retrieved successfully', invoices);
    } catch (err) {
      next(err);
    }
  }

  public static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await BillingService.getInvoiceById(req.params.id as string);
      return ApiResponse.success(res, 'Invoice details retrieved', invoice);
    } catch (err) {
      next(err);
    }
  }

  public static async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await BillingService.createInvoice(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Invoice generated successfully', invoice, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BillingService.recordPayment(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Payment recorded successfully', result, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await BillingService.getReceipt(req.params.id as string);
      return ApiResponse.success(res, 'Payment receipt generated', receipt);
    } catch (err) {
      next(err);
    }
  }
}
