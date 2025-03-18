export type InputEmail = string;

export function getInternalDomainList() {
    return useGlobalStore().config?.INTERNAL_DOMAIN_LIST ?? [];
}

export function validateEmail(input: InputEmail) {
    const { $i18n } = useNuxtApp();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: { path: string; message: string }[] = [];

    if (!input) {
        return [{ path: 'email', message: $i18n.t('email-policy-required') }];
    }
    if (!emailRegex.test(input)) {
        return [{ path: 'email', message: $i18n.t('email-policy-invalid') }];
    }

    return errors;
}

export function isValidInternalEmail(input: InputEmail) {
    const { $i18n } = useNuxtApp();
    const internalDomainList = getInternalDomainList();

    if (internalDomainList.some(domain => input.includes(domain))) {
        return [{ path: 'email', message: $i18n.t('email-policy-is-themallgroup', { atSignSymbol: '@' }) }];
    }

    return [];
}