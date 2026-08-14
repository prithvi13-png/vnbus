import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "PasswordsMatch", async: false })
export class PasswordsMatchConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const candidate = args.object as { password?: string; newPassword?: string };
    const comparison = candidate.password ?? candidate.newPassword;

    return typeof comparison === "string" && value === comparison;
  }

  defaultMessage(): string {
    return "password confirmation must match";
  }
}

export function PasswordsMatch(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) => {
    const options = {
      target: target.constructor,
      propertyName: String(propertyName),
      constraints: [],
      validator: PasswordsMatchConstraint,
    };

    registerDecorator({
      ...options,
      ...(validationOptions ? { options: validationOptions } : {}),
    });
  };
}
