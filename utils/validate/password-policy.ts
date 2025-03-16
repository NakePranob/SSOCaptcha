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
    };;

    if (passwordPolicy.RequireLowercase && !/[a-z]/.test(input)) {
        errors.push({ path: 'password', message: 'Password must contain a lower case letter' });
    }
    if (passwordPolicy.RequireUppercase && !/[A-Z]/.test(input)) {
        errors.push({ path: 'password', message: 'Password must contain an upper case letter' });
    }
    if (passwordPolicy.RequireNumbers && !/\d/.test(input)) {
        errors.push({ path: 'password', message: 'Password must contain a number' });
    }
    if (!input || typeof input !== "string") {
        errors.push({ path: "password", message: `Password must contain at least ${form.passwordPolicy.MinimumLength} characters` });
    } else if (input.length < passwordPolicy.MinimumLength) {
        errors.push({ path: "password", message: `Password must contain at least ${form.passwordPolicy.MinimumLength} characters` });
    }
    if (passwordPolicy.RequireSymbols && !regex.test(input)) {
        errors.push({ path: 'password', message: 'Password must contain a special character or a space' });
    }
    if (/^\s|\s$/.test(input)) {
        errors.push({ path: 'password', message: 'Password must not contain a leading or trailing space' });
    }

    return errors;
}