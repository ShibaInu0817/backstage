import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    try {
      console.log('Verifying token:', token.substring(0, 20) + '...');
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      if (!secretKey) {
        console.error('CLERK_SECRET_KEY is not defined in config');
        throw new Error('Server configuration error');
      }

      const session = await verifyToken(token, {
        secretKey: secretKey,
      });
      
      console.log('Decoded session:', JSON.stringify(session));

      const userId = session.sub;
      // Support both default Clerk session token and custom JWT templates
      const tenantId = (session as any).org_id || (session as any).o?.id;

      if (!tenantId) {
        console.warn('No tenantId found in session:', session);
        throw new UnauthorizedException('No organization/tenant associated with this session');
      }

      request['user'] = {
        userId,
        tenantId,
      };

      return true;
    } catch (error: any) {
      console.error('Clerk verification failed:', error.message);
      throw new UnauthorizedException('Invalid token: ' + error.message);
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
