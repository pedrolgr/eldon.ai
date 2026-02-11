import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JWTService } from './jwt.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JWTService],
})
export class AuthModule { }
