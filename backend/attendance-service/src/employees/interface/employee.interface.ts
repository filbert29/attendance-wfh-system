/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export interface AuthRequestUser {
  userId: number;
  type: string;
}

export class CreateEmployeeDto {
  name: string;
  position: string;
  email: string;
  password: string;
  user_type: string;
}

export class UpdateEmployeeDto {
  email: string;
  name: string;
  position: string;
  user_type: string;
}

export interface CreateUserResponse {
  userId: number;
}

export interface AuthErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

export class GetEmployeeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  emp_id?: number;
}
