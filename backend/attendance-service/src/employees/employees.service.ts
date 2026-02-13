import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { Employee } from './entity/employee.entity';
import {
  AuthErrorResponse,
  AuthRequestUser,
  CreateEmployeeDto,
  CreateUserResponse,
  UpdateEmployeeDto,
} from './interface/employee.interface';
import { Attendance } from 'src/attendance/entity/attendance.entity';
import { AttendancePicture } from 'src/attendance/entity/attendance-picture.entity';
import { AttendanceRequest } from 'src/attendance/entity/attendance-request.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmployeesService {
  private readonly authServiceUrl: string;

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(AttendancePicture)
    private readonly pictureRepo: Repository<AttendancePicture>,

    @InjectRepository(AttendanceRequest)
    private readonly requestRepo: Repository<AttendanceRequest>,

    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('AUTH_SERVICE_URL');

    if (!url) {
      throw new Error('AUTH_SERVICE_URL belum diset');
    }

    this.authServiceUrl = url;
  }

  findByUserId(user_id: number) {
    return this.employeeRepo.findOne({
      where: { user_id },
    });
  }

  async findOneByUserId(userId: number) {
    return this.employeeRepo.findOne({
      where: { user_id: userId },
    });
  }

  async getEmployees(filter: { emp_id?: number }) {
    const employees = await this.employeeRepo.find({
      order: { emp_id: 'DESC' },
      where: filter.emp_id ? { emp_id: filter.emp_id } : {},
    });

    if (employees.length === 0) return [];

    const userIds = employees.map((e) => e.user_id);

    try {
      const res: AxiosResponse<AuthRequestUser[]> = await axios.post(
        `${this.authServiceUrl}/users/bulk`,
        { userIds },
      );

      const users = res.data;

      const userMap = new Map(users.map((u) => [u.userId, u]));

      return employees.map((emp) => ({
        ...emp,
        user: userMap.get(emp.user_id) || null,
      }));
    } catch {
      throw new Error('Gagal ambil data user dari auth-service');
    }
  }

  async createEmployee(dto: CreateEmployeeDto, adminName: string) {
    try {
      const { data } = await axios.post<CreateUserResponse>(
        `${this.authServiceUrl}/users`,
        {
          email: dto.email,
          password: dto.password,
          type: dto.user_type,
          created_by: adminName,
        },
      );

      const userId = data.userId;

      const employee = this.employeeRepo.create({
        name: dto.name,
        position_name: dto.position,
        user_id: userId,
        created_by: adminName,
        modified_by: adminName,
      });

      return this.employeeRepo.save(employee);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal membuat employee');
    }
  }

  async updateEmployee(empId: number, dto: UpdateEmployeeDto, adminId: number) {
    const employee = await this.employeeRepo.findOne({
      where: { emp_id: empId },
    });

    if (!employee) {
      throw new NotFoundException('Employee tidak ditemukan');
    }

    const admin = await this.employeeRepo.findOne({
      where: { user_id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin tidak ditemukan');
    }

    const adminName = admin.name;

    try {
      await axios.patch(`${this.authServiceUrl}/users/${employee.user_id}`, {
        email: dto.email,
        type: dto.user_type,
        modified_by: adminName,
      });

      await this.employeeRepo.update(empId, {
        name: dto.name,
        position_name: dto.position,
        modified_by: adminName,
        modified_date: new Date(),
      });

      return this.employeeRepo.findOne({
        where: { emp_id: empId },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal update employee');
    }
  }

  async deleteEmployee(empId: number) {
    try {
      const employee = await this.employeeRepo.findOne({
        where: { emp_id: empId },
      });

      if (!employee) {
        throw new NotFoundException('Employee tidak ditemukan');
      }

      const attendances = await this.attendanceRepo.find({
        where: { emp_id: empId },
      });

      const attendanceIds = attendances.map((a) => a.att_id);

      if (attendanceIds.length > 0) {
        await this.pictureRepo
          .createQueryBuilder()
          .delete()
          .where('att_id IN (:...ids)', { ids: attendanceIds })
          .execute();

        await this.requestRepo
          .createQueryBuilder()
          .delete()
          .where('att_id IN (:...ids)', { ids: attendanceIds })
          .execute();
      }

      await this.attendanceRepo.delete({ emp_id: empId });
      await this.employeeRepo.delete(empId);

      try {
        await axios.delete(`${this.authServiceUrl}/users/${employee.user_id}`);
      } catch (error: unknown) {
        if (axios.isAxiosError<AuthErrorResponse>(error)) {
          const errorMessage =
            error.response?.data?.message ??
            'Gagal menghapus user di auth service';

          throw new InternalServerErrorException(errorMessage);
        }

        throw new InternalServerErrorException(
          'Terjadi kesalahan saat menghubungi auth service',
        );
      }

      return { message: 'Employee deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Delete employee error:', error);

      throw new InternalServerErrorException(
        'Terjadi kesalahan saat menghapus employee',
      );
    }
  }

  async countAttendance(empId: number) {
    const count = await this.attendanceRepo.count({
      where: { emp_id: empId },
    });

    return { count };
  }

  async getAdminEmployees() {
    const employees = await this.employeeRepo.find({
      order: { emp_id: 'DESC' },
    });

    if (employees.length === 0) return [];

    const userIds = employees.map((e) => e.user_id);

    try {
      const res = await axios.post<
        { userId: number; email: string; type: string }[]
      >(`${this.authServiceUrl}/users/bulk`, { userIds });

      const users = res.data;

      const userMap = new Map<
        number,
        { userId: number; email: string; type: string }
      >(users.map((u) => [u.userId, u]));

      return employees
        .map((emp) => ({
          ...emp,
          user: userMap.get(emp.user_id),
        }))
        .filter((emp) => emp.user?.type === 'admin');
    } catch {
      throw new Error('Gagal ambil data user dari auth-service');
    }
  }
}
