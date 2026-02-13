import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import type { AuthRequestUser } from './interface/employee.interface';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from './interface/employee.interface';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@Controller('employees')
@UseGuards(AuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('me')
  getMyEmployee(@CurrentUser() user: AuthRequestUser) {
    return this.employeesService.findOneByUserId(user.userId);
  }

  @Get()
  getAll(
    @CurrentUser() user: AuthRequestUser,
    @Query('emp_id') empId?: string,
  ) {
    let finalEmpId: number | undefined = undefined;

    if (user.type !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa melihat data');
    } else {
      if (empId) {
        finalEmpId = Number(empId);
      }
    }

    return this.employeesService.getEmployees({ emp_id: finalEmpId });
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: AuthRequestUser) {
    if (user.type !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa membuat employee');
    }

    return this.employeesService.createEmployee(dto, user.type);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthRequestUser,
  ) {
    if (user.type !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa update employee');
    }

    return this.employeesService.updateEmployee(id, dto, user.userId);
  }

  @Delete(':id')
  deleteEmployee(
    @Param('id') id: number,
    @CurrentUser() user: AuthRequestUser,
  ) {
    if (user.type !== 'admin') {
      throw new ForbiddenException('Hanya admin');
    }

    return this.employeesService.deleteEmployee(id);
  }

  @Get(':id/attendance-count')
  getAttendanceCount(@Param('id') id: number) {
    return this.employeesService.countAttendance(id);
  }

  @Put(':id')
  updateEmployee(
    @Param('id') id: number,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthRequestUser,
  ) {
    if (user.type !== 'admin') {
      throw new ForbiddenException('Hanya admin');
    }

    console.log('Updating employee with ID:', id, 'using data:', dto);

    return this.employeesService.updateEmployee(id, dto, user.userId);
  }

  @Get('admins')
  getAdminEmployees() {
    return this.employeesService.getAdminEmployees();
  }
}
