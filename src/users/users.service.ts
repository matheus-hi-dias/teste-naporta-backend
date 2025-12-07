import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly saltRounds: number;
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = this.configService.get<number>('SALT_ROUNDS', 10);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const emailExists = await this.emailExists({
        email: createUserDto.email,
      });

      if (emailExists) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await hash(
        createUserDto.password,
        this.saltRounds,
      );

      const userData = {
        ...createUserDto,
        password: hashedPassword,
      };

      return await this.prismaService.user.create({ data: userData });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error creating user', trace ?? message);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        orders: true,
      },
    });
  }

  async searchByEmail(email: string) {
    return await this.prismaService.user.findUnique({ where: { email } });
  }

  private async emailExists({
    email,
    id,
  }: {
    email: string;
    id?: string;
  }): Promise<boolean> {
    const user = await this.searchByEmail(email);
    if (id && id == user?.id) {
      return false;
    }
    return user !== null;
  }
}
