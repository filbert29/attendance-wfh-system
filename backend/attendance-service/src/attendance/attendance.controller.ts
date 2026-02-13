import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AttendanceService } from './attendance.service';
import { EmployeesService } from 'src/employees/employees.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { extname } from 'path';
import * as fs from 'fs';
import type { AuthRequestUser } from 'src/employees/interface/employee.interface';

@Controller('attendance')
@UseGuards(AuthGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly employeesService: EmployeesService,
  ) {}

  @Delete('picture/:seq_id')
  async deleteAttendancePicture(@Param('seq_id', ParseIntPipe) seq_id: number) {
    return this.attendanceService.deleteAttendancePicture(seq_id);
  }

  @Get('picture/:att_id')
  getAttendancePictures(@Param('att_id', ParseIntPipe) att_id: number) {
    if (Number.isNaN(att_id)) {
      throw new BadRequestException('att_id tidak valid');
    }

    return this.attendanceService.getAttendancePictures(att_id);
  }

  @Post('record')
  async record(@CurrentUser() user: AuthRequestUser) {
    const employee = await this.employeesService.findByUserId(user.userId);

    if (!employee) {
      throw new BadRequestException('Employee tidak ditemukan');
    }

    return this.attendanceService.recordAttendance(
      employee.emp_id,
      employee.name,
    );
  }

  @Get('today')
  async getToday(@CurrentUser() user: AuthRequestUser) {
    const employee = await this.employeesService.findByUserId(user.userId);

    if (!employee) {
      throw new BadRequestException('Employee tidak ditemukan');
    }

    return this.attendanceService.getTodayAttendance(employee.emp_id);
  }

  @Post('picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/attendance',
        filename: (_req, file, cb) => {
          cb(null, 'att_' + Date.now() + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('File harus berupa image'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadAndSave(
    @CurrentUser() user: AuthRequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      att_id: number;
      task: string;
      description: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const employee = await this.employeesService.findByUserId(user.userId);

    if (!employee) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Employee tidak ditemukan');
    }

    try {
      return await this.attendanceService.saveAttendancePicture(
        body.att_id,
        file.path,
        body.task,
        body.description,
        employee.name,
      );
    } catch (error) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Get('picture/detail/:seq_id')
  getAttendancePictureDetail(@Param('seq_id', ParseIntPipe) seq_id: number) {
    return this.attendanceService.getAttendancePictureDetail(seq_id);
  }

  @Get('list')
  async getAttendanceList(
    @CurrentUser() user: AuthRequestUser,
    @Query('emp_id') empId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: string,
  ) {
    let finalEmpId: number | undefined;

    if (user.type !== 'admin') {
      const employee = await this.employeesService.findByUserId(user.userId);

      if (!employee) {
        throw new BadRequestException('Employee tidak ditemukan');
      }

      finalEmpId = employee.emp_id;
    } else {
      if (empId) {
        finalEmpId = Number(empId);
      }
    }

    return this.attendanceService.getAttendanceList({
      emp_id: finalEmpId,
      start_date: startDate,
      end_date: endDate,
      status,
    });
  }

  @Post('request')
  async createRequest(
    @CurrentUser() user: AuthRequestUser,
    @Body()
    body: {
      date: string;
      request_checkin: string;
      request_checkout: string;
      remark: string;
    },
  ) {
    return this.attendanceService.createAttendanceRequest(user, body);
  }

  @Get('request/list')
  async getAttendanceRequestList(
    @CurrentUser() user: AuthRequestUser,
    @Query('emp_id') empId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: string,
  ) {
    let finalEmpId: number | undefined = undefined;

    if (user.type !== 'admin') {
      const employee = await this.employeesService.findByUserId(user.userId);

      if (!employee) {
        throw new BadRequestException('Employee tidak ditemukan');
      }

      finalEmpId = employee.emp_id;
    } else {
      if (empId) {
        finalEmpId = Number(empId);
      }
    }

    return this.attendanceService.getAttendanceRequestList(user, {
      emp_id: finalEmpId,
      start_date: startDate,
      end_date: endDate,
      status,
    });
  }

  @Post('request/:id/approve')
  async approveRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthRequestUser,
  ) {
    if (user.type !== 'admin') {
      throw new BadRequestException('Hanya admin yang bisa approve');
    }

    return this.attendanceService.approveAttendanceRequest(id, user);
  }

  @Post('request/:id/reject')
  async rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthRequestUser,
    @Body() body: { reject_reason: string },
  ) {
    if (user.type !== 'admin') {
      throw new BadRequestException('Hanya admin yang bisa reject');
    }

    return this.attendanceService.rejectAttendanceRequest(
      id,
      body.reject_reason,
      user,
    );
  }
}
