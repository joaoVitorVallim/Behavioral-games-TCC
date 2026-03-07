import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Realizar login',
    description: 'Autentica um usuário e retorna token JWT para acesso à API',
  })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso',
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'ab5d10f7-8522-498c-a585-97cdc9d0956d',
        name: 'João Silva',
        login: 'joao.silva',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação - login ou senha inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais incorretas',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.login, dto.password);
  }
}
