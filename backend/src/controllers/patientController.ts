import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patientService';
import { ApiResponse } from '../utils/apiResponse';

export class PatientController {
  public static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PatientService.getPatients(req.query as any);
      return ApiResponse.success(res, 'Patients retrieved successfully', result.patients, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  public static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientService.getPatientById(req.params.id as string);
      return ApiResponse.success(res, 'Patient details retrieved', patient);
    } catch (err) {
      next(err);
    }
  }

  public static async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientService.createPatient(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Patient registered successfully', patient, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientService.updatePatient(req.params.id as string, req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Patient record updated', patient);
    } catch (err) {
      next(err);
    }
  }

  public static async softDeletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PatientService.softDeletePatient(req.params.id as string, req.user?.id, req.user?.name);
      return ApiResponse.success(res, result.message, null);
    } catch (err) {
      next(err);
    }
  }

  public static async getMedicalHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await PatientService.getMedicalHistory(req.params.id as string);
      return ApiResponse.success(res, 'Medical history timeline retrieved', history);
    } catch (err) {
      next(err);
    }
  }

  public static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'No document file uploaded', [], 400);
      }
      const category = req.body.category || 'OTHER';
      const doc = await PatientService.addDocument(req.params.id as string, req.file, category, req.user?.name || 'Staff');
      return ApiResponse.success(res, 'Document uploaded successfully', doc, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PatientService.deleteDocument(req.params.id as string);
      return ApiResponse.success(res, result.message, null);
    } catch (err) {
      next(err);
    }
  }
}
