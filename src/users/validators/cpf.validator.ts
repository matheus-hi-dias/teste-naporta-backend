import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'cpf', async: false })
export class CpfValidator implements ValidatorConstraintInterface {
  validate(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    const calc = (len: number) => {
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += Number(cpf[i]) * (len + 1 - i);
      }
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };

    const dv1 = calc(9);
    const dv2 = calc(10);

    return dv1 === Number(cpf[9]) && dv2 === Number(cpf[10]);
  }

  defaultMessage(): string {
    return 'cpf is invalid';
  }
}
