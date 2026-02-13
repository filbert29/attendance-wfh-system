import { Body, Controller, Patch, Post, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import type {
  EmployeeCreateInterface,
  EmployeeUpdateInterface,
} from './interface/users.interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() body: EmployeeCreateInterface) {
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: EmployeeUpdateInterface) {
    return this.usersService.updateUser(id, body);
  }

  @Post('bulk')
  bulk(@Body() body: { userIds: number[] }) {
    return this.usersService.findByIds(body.userIds);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }
}
