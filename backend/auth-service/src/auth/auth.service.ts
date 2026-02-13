import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Email atau password salah');
    }

    return {
      access_token: this.jwtService.sign({
        userId: user.userId,
        type: user.type,
      }),
      user,
    };
  }
}
