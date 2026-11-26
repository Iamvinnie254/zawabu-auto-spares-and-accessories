import { Controller, Get, Post } from '@nestjs/common'
import { loginSchema, type LoginInput } from '@zawabu/shared'

import { Public } from '../common/auth.decorators'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { ZodBody } from '../common/zod-params'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@ZodBody(loginSchema) body: LoginInput) {
    return this.authService.login(body)
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id)
  }
}
