export type InputPassword = string;

export function validatePasswordPolicy(input: InputPassword) {
    const regex = /[\^\$\*\.\[\]\{\}\(\)\?"!@#%&\/\\,><':;|_~`=+\-]/;
    const form = useFormStore();
    const errors: { path: string; message: string }[] = [];
    const passwordPolicy = form.passwordPolicy || {
        RequireLowercase: false,
        RequireUppercase: false,
        RequireNumbers: false,
        MinimumLength: 8,
        RequireSymbols: false,
    };

    const checks = [
        { condition: passwordPolicy.RequireLowercase && !/[a-z]/.test(input), message: 'Password must contain a lower case letter' },
        { condition: passwordPolicy.RequireUppercase && !/[A-Z]/.test(input), message: 'Password must contain an upper case letter' },
        { condition: passwordPolicy.RequireNumbers && !/\d/.test(input), message: 'Password must contain a number' },
        { condition: !input || typeof input !== "string" || input.length < passwordPolicy.MinimumLength, message: `Password must contain at least ${passwordPolicy.MinimumLength} characters` },
        { condition: passwordPolicy.RequireSymbols && !regex.test(input), message: 'Password must contain a special character or a space' },
        { condition: /^\s|\s$/.test(input), message: 'Password must not contain a leading or trailing space' }
    ];

    checks.forEach(check => {
        if (check.condition) {
            errors.push({ path: 'password', message: check.message });
        }
    });

    return errors;
}