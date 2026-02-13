import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entity/employee.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { AuthClientService } from '../auth/auth-client.service';
import { AuthGuard } from '../auth/auth.guard';
import { Attendance } from '../attendance/entity/attendance.entity';
import { AttendancePicture } from '../attendance/entity/attendance-picture.entity';
import { AttendanceRequest } from '../attendance/entity/attendance-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Attendance,
      AttendancePicture,
      AttendanceRequest,
    ]),
  ],
  providers: [EmployeesService, AuthClientService, AuthGuard],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
