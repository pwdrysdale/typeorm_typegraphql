import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import { User } from "../../../entities/Users";

@ValidatorConstraint({ async: true })
export class IsUserAlreadyExistsConstraint
    implements ValidatorConstraintInterface
{
    validate(email: string) {
        return User.findOne({ where: { email } }).then((user) => {
            if (user) return false;
            return true;
        });
    }
}

export function IsEmailAlreadyExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUserAlreadyExistsConstraint,
        });
    };
}
