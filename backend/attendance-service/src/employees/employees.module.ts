import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entity/employee.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { AuthClientService } from 'src/auth/auth-client.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Attendance } from 'src/attendance/entity/attendance.entity';
import { AttendancePicture } from 'src/attendance/entity/attendance-picture.entity';
import { AttendanceRequest } from 'src/attendance/entity/attendance-request.entity';

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
