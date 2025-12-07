import { HttpException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.searchByEmail(loginDto.email);

    if (!user) throw new HttpException('Invalid credentials', 401);

    const comparePasswords = await compare(loginDto.password, user?.password);

    if (!comparePasswords) {
      throw new HttpException('Invalid credentials', 401);
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return {
      access_token: accessToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userService.findOne(userId);
    return user;
  }
}
