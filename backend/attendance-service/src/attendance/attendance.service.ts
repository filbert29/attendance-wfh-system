import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Attendance } from './entity/attendance.entity';
import { AttendancePicture } from './entity/attendance-picture.entity';
import { Employee } from 'src/employees/entity/employee.entity';
import { AttendanceRequest } from './entity/attendance-request.entity';
import { AuthRequestUser } from 'src/employees/interface/employee.interface';

@Injectable()
export class AttendanceService {
  [x: string]: any;
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(AttendancePicture)
    private readonly pictureRepo: Repository<AttendancePicture>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(AttendanceRequest)
    private readonly requestRepo: Repository<AttendanceRequest>,

    private readonly dataSource: DataSource,
  ) {}

  private getToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async getTodayAttendance(empId: number) {
    const today = this.getToday();

    const attendance = await this.attendanceRepo
      .createQueryBuilder('att')
      .where('att.emp_id = :empId', { empId })
      .andWhere('DATE(att.created_date) = :today', { today })
      .getOne();

    if (!attendance) {
      return {
        actual_start: null,
        actual_end: null,
      };
    }

    return {
      att_id: attendance.att_id,
      actual_start: attendance.actual_start,
      actual_end: attendance.actual_end,
      att_status: attendance.att_status,
    };
  }

  async recordAttendance(empId: number, name: string) {
    const today = this.getToday();
    const now = new Date();

    const attendance = await this.attendanceRepo
      .createQueryBuilder('att')
      .where('att.emp_id = :empId', { empId })
      .andWhere('DATE(att.created_date) = :today', { today })
      .getOne();

    if (!attendance) {
      const newAttendance = this.attendanceRepo.create({
        emp_id: empId,
        actual_start: now,
        actual_end: null,
        created_by: name,
        modified_by: name,
      });

      newAttendance.att_status = this.calculateAttendanceStatus(
        newAttendance.actual_start,
        newAttendance.actual_end,
      );

      await this.attendanceRepo.save(newAttendance);

      return {
        type: 'IN',
        time: newAttendance.actual_start,
        message: 'Berhasil absen masuk',
      };
    }

    if (attendance.actual_start && !attendance.actual_end) {
      attendance.actual_end = now;
      attendance.modified_by = name;
      attendance.modified_date = now;

      attendance.att_status = this.calculateAttendanceStatus(
        attendance.actual_start,
        attendance.actual_end,
      );

      await this.attendanceRepo.save(attendance);

      return {
        type: 'OUT',
        time: attendance.actual_end,
        message: 'Berhasil absen pulang',
      };
    }

    attendance.actual_end = now;
    attendance.modified_by = name;
    attendance.modified_date = now;

    attendance.att_status = this.calculateAttendanceStatus(
      attendance.actual_start,
      attendance.actual_end,
    );

    await this.attendanceRepo.save(attendance);

    return {
      type: 'OUT_UPDATE',
      time: attendance.actual_end,
      message: 'Jam pulang berhasil diperbarui',
    };
  }

  private calculateAttendanceStatus(
    actualStart: Date | null,
    actualEnd: Date | null,
  ): string {
    const statuses: string[] = [];

    if (!actualStart && !actualEnd) {
      return '';
    }

    statuses.push('PRS');

    if (actualStart) {
      const inTime = new Date(actualStart);
      const lateLimit = new Date(actualStart);
      lateLimit.setHours(8, 10, 0, 0);

      if (inTime > lateLimit) {
        statuses.push('LTI');
      }
    }

    if (actualEnd) {
      const outTime = new Date(actualEnd);
      const earlyLimit = new Date(actualEnd);
      earlyLimit.setHours(17, 0, 0, 0);

      if (outTime < earlyLimit) {
        statuses.push('EAO');
      }
    }

    return statuses.join(',');
  }

  async saveAttendancePicture(
    att_id: number,
    pic_dic: string,
    task: string,
    description: string,
    created_by: string,
  ) {
    if (!att_id) {
      throw new BadRequestException('Attendance tidak ditemukan');
    }

    const pic = this.pictureRepo.create({
      att_id,
      pic_dic,
      task,
      description,
      created_by,
    });

    return this.pictureRepo.save(pic);
  }

  async getAttendancePictures(att_id: number) {
    return this.pictureRepo.find({
      where: { att_id },
      order: { created_date: 'DESC' },
    });
  }

  async getAttendancePictureDetail(seq_id: number) {
    return this.pictureRepo.findOne({
      where: { seq_id },
    });
  }

  async deleteAttendancePicture(seq_id: number) {
    const pic = await this.pictureRepo.findOne({
      where: { seq_id },
    });

    if (!pic) {
      throw new NotFoundException('Attendance picture tidak ditemukan');
    }

    const filePath = path.join(process.cwd(), pic.pic_dic);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.pictureRepo.delete({ seq_id });

    return {
      message: 'Attendance picture deleted',
    };
  }

  async getAttendanceList(filter: {
    emp_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
  }) {
    const qb = this.attendanceRepo
      .createQueryBuilder('att')
      .orderBy('att.created_date', 'DESC');

    if (filter.emp_id) {
      qb.andWhere('att.emp_id = :emp_id', {
        emp_id: filter.emp_id,
      });
    }

    if (filter.start_date) {
      qb.andWhere('DATE(att.created_date) >= :start', {
        start: filter.start_date,
      });
    }

    if (filter.end_date) {
      qb.andWhere('DATE(att.created_date) <= :end', {
        end: filter.end_date,
      });
    }

    if (filter.status) {
      qb.andWhere('att.att_status LIKE :status', {
        status: `%${filter.status}%`,
      });
    }

    const attendances = await qb.getMany();

    if (attendances.length === 0) return [];

    const empIds = [...new Set(attendances.map((a) => a.emp_id))];

    const employees = await this.employeeRepo.find({
      where: {
        emp_id: In(empIds),
      },
      select: ['emp_id', 'name'],
    });

    const empMap = new Map(employees.map((emp) => [emp.emp_id, emp.name]));

    return attendances.map((att) => ({
      ...att,
      employee_name: empMap.get(att.emp_id) || null,
    }));
  }

  async createAttendanceRequest(
    user: AuthRequestUser,
    body: {
      date: string;
      request_checkin: string;
      request_checkout: string;
      remark: string;
    },
  ) {
    const employee = await this.employeeRepo.findOne({
      where: { user_id: user.userId },
    });

    if (!employee) {
      throw new BadRequestException('Employee tidak ditemukan');
    }

    const attendance = await this.attendanceRepo
      .createQueryBuilder('att')
      .where('att.emp_id = :empId', { empId: employee.emp_id })
      .andWhere('DATE(att.created_date) = :date', {
        date: body.date,
      })
      .getOne();

    if (!attendance) {
      throw new BadRequestException(
        'Attendance pada tanggal tersebut tidak ditemukan',
      );
    }

    const requestDate = body.date;

    const requestCheckIn = body.request_checkin
      ? new Date(`${requestDate} ${body.request_checkin}`)
      : null;

    const requestCheckOut = body.request_checkout
      ? new Date(`${requestDate} ${body.request_checkout}`)
      : null;

    const existingRequest = await this.requestRepo.findOne({
      where: {
        att_id: attendance.att_id,
        status: 'Waiting Approval',
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Masih ada request yang belum diproses');
    }

    const request = this.requestRepo.create({
      att_id: attendance.att_id,
      request_checkin: requestCheckIn,
      request_checkout: requestCheckOut,
      remark: body.remark,
      status: 'Waiting Approval',
      created_by: employee.name,
      modified_by: employee.name,
    } as AttendanceRequest);

    return this.requestRepo.save(request);
  }

  async getAttendanceRequestList(
    user: AuthRequestUser,
    filter: {
      emp_id?: number;
      start_date?: string;
      end_date?: string;
      status?: string;
    },
  ) {
    const qb = this.requestRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.attendance', 'att')
      .orderBy('req.created_date', 'DESC');

    if (user.type !== 'admin') {
      const employee = await this.employeeRepo.findOne({
        where: { user_id: user.userId },
      });

      if (!employee) {
        throw new BadRequestException('Employee tidak ditemukan');
      }

      qb.andWhere('att.emp_id = :empId', {
        empId: employee.emp_id,
      });
    } else {
      if (filter.emp_id) {
        qb.andWhere('att.emp_id = :empId', {
          empId: filter.emp_id,
        });
      }
    }

    if (filter.start_date) {
      qb.andWhere('DATE(att.created_date) >= :start', {
        start: filter.start_date,
      });
    }

    if (filter.end_date) {
      qb.andWhere('DATE(att.created_date) <= :end', {
        end: filter.end_date,
      });
    }

    if (filter.status) {
      qb.andWhere('req.status = :status', {
        status: filter.status,
      });
    }

    const requests = await qb.getMany();

    if (requests.length === 0) return [];

    // ambil employee name
    const empIds = [...new Set(requests.map((r) => r.attendance.emp_id))];

    const employees = await this.employeeRepo.find({
      where: { emp_id: In(empIds) },
      select: ['emp_id', 'name'],
    });

    const empMap = new Map(employees.map((e) => [e.emp_id, e.name]));

    return requests.map((req) => ({
      ...req,
      employee_name: empMap.get(req.attendance.emp_id),
      tanggal: req.attendance.created_date,
      actual_start: req.attendance.actual_start,
      actual_end: req.attendance.actual_end,
    }));
  }

  async approveAttendanceRequest(reqId: number, user: AuthRequestUser) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(AttendanceRequest, {
        where: { req_id: reqId },
      });

      if (!request) {
        throw new NotFoundException('Request tidak ditemukan');
      }

      if (request.status !== 'Waiting Approval') {
        throw new BadRequestException('Request sudah diproses');
      }

      const attendance = await queryRunner.manager.findOne(Attendance, {
        where: { att_id: request.att_id },
      });

      if (!attendance) {
        throw new NotFoundException('Attendance tidak ditemukan');
      }

      const admin = await this.employeeRepo.findOne({
        where: { user_id: user.userId },
      });

      if (!admin) {
        throw new NotFoundException('Admin tidak ditemukan');
      }

      // update attendance
      attendance.actual_start =
        request.request_checkin ?? attendance.actual_start;

      attendance.actual_end = request.request_checkout ?? attendance.actual_end;

      attendance.modified_by = admin.name;
      attendance.modified_date = new Date();

      attendance.att_status = this.calculateAttendanceStatus(
        attendance.actual_start,
        attendance.actual_end,
      );

      await queryRunner.manager.save(attendance);

      // update request
      request.status = 'Approved';
      request.modified_by = admin.name;
      request.modified_date = new Date();

      await queryRunner.manager.save(request);

      await queryRunner.commitTransaction();

      return { message: 'Request berhasil diapprove' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectAttendanceRequest(
    reqId: number,
    rejectReason: string,
    user: AuthRequestUser,
  ) {
    if (!rejectReason || rejectReason.trim() === '') {
      throw new BadRequestException('Reject reason wajib diisi');
    }

    const request = await this.requestRepo.findOne({
      where: { req_id: reqId },
    });

    if (!request) {
      throw new NotFoundException('Request tidak ditemukan');
    }

    if (request.status !== 'Waiting Approval') {
      throw new BadRequestException('Request sudah diproses');
    }

    const admin = await this.employeeRepo.findOne({
      where: { user_id: user.userId },
    });

    if (!admin) {
      throw new NotFoundException('Admin tidak ditemukan');
    }

    request.status = 'Rejected';
    request.reject_reason = rejectReason;
    request.modified_by = admin.name;
    request.modified_date = new Date();

    await this.requestRepo.save(request);

    return { message: 'Request berhasil direject' };
  }
}
