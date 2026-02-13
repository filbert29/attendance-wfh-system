import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequestUser } from 'src/employees/interface/employee.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthRequestUser => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return request.user as AuthRequestUser;
  },
);
