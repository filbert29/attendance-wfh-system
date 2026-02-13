import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthClientService {
  async validateToken(authHeader?: string): Promise<Record<string, unknown>> {
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    try {
      const res = await axios.get<Record<string, unknown>>(
        `${process.env.AUTH_SERVICE_URL}/auth/validate-token`,
        {
          headers: {
            Authorization: authHeader,
          },
        },
      );
      return res.data;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
