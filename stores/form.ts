import { defineStore } from 'pinia';

export const useFormStore = defineStore('form', {
    state: (): {
        typePassword: TypePassword;
        passwordPolicy: PasswordPolicyType;
    } => {
        return {
            typePassword: true,
            passwordPolicy: {
                MinimumLength: 6,
                RequireUppercase: false,
                RequireLowercase: false,
                RequireSymbols: false,
                RequireNumbers: false,
            },
        };
    },
    actions: {
        toggleTypePassword() {
            this.typePassword = !this.typePassword;
        },
        setPasswordPolicy(obj: PasswordPolicyType) {
            this.passwordPolicy = obj;
        }
    }
});