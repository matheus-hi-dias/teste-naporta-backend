import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import { CpfValidator } from '../validators/cpf.validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'cpf must contain exactly 11 digits' })
  @Validate(CpfValidator)
  cpf: string;
}
