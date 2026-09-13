import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';

export class DepartmentService {
  public static async getDepartments() {
    return prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { doctors: true, users: true }
        }
      }
    });
  }

  public static async getDepartmentById(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { doctors: true }
    });

    if (!dept) {
      throw ApiError.notFound('Department not found');
    }

    return dept;
  }

  public static async createDepartment(input: { code: string; name: string; description?: string; headDoctorId?: string }) {
    return prisma.department.create({
      data: {
        code: input.code.toUpperCase(),
        name: input.name,
        description: input.description,
        headDoctorId: input.headDoctorId
      }
    });
  }

  public static async updateDepartment(id: string, input: Partial<{ name: string; description: string; headDoctorId: string; status: string }>) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Department not found');
    }

    return prisma.department.update({
      where: { id },
      data: input
    });
  }
}
