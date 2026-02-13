import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entity/user.entity';
import {
  EmployeeCreateInterface,
  EmployeeUpdateInterface,
} from './interface/users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async createUser(data: EmployeeCreateInterface): Promise<{ userId: number }> {
    const exist = await this.repo.findOne({
      where: { email: data.email },
    });

    if (exist) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword: string = await bcrypt.hash(data.password, 10);

    const user = this.repo.create({
      email: data.email,
      password: hashedPassword,
      type: data.type,
      created_by: data.created_by,
      modified_by: data.created_by,
    });

    const saved = await this.repo.save(user);

    return { userId: saved.userId };
  }

  async updateUser(id: number, data: EmployeeUpdateInterface) {
    await this.repo.update(id, {
      email: data.email,
      type: data.type,
      modified_by: data.modified_by,
      modified_date: new Date(),
    });

    return { message: 'User updated' };
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByIds(ids: number[]) {
    return this.repo.find({
      where: {
        userId: In(ids),
      },
      select: ['userId', 'email', 'type'],
    });
  }

  async deleteUser(id: number) {
    await this.repo.delete(id);
    return { message: 'User deleted' };
  }
}
