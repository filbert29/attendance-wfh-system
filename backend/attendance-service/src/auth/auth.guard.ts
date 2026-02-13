import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthClientService } from '../auth/auth-client.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authClient: AuthClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    try {
      const user = await this.authClient.validateToken(authHeader);
      request.user = user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
