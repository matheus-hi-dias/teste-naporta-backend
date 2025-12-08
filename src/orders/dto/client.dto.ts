import { IsNotEmpty, IsString, Matches, Validate } from 'class-validator';
import { CpfValidator } from 'src/users/validators/cpf.validator';

export class ClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'cpf must contain exactly 11 digits' })
  @Validate(CpfValidator)
  document: string;
}
