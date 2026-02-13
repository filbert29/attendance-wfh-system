import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AuthClientService } from '../auth/auth-client.service';
import { AuthGuard } from '../auth/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entity/attendance.entity';
import { AttendancePicture } from './entity/attendance-picture.entity';
import { EmployeesModule } from 'src/employees/employees.module';
import { Employee } from 'src/employees/entity/employee.entity';
import { AttendanceRequest } from './entity/attendance-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      AttendancePicture,
      AttendanceRequest,
      Employee,
    ]),
    EmployeesModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AuthClientService, AuthGuard],
})
export class AttendanceModule {}
