export type InputEmail = string;

export function getInternalDomainList() {
    return useGlobalStore().config?.INTERNAL_DOMAIN_LIST ?? [];
}

export function validateEmail(input: InputEmail) {
    const { $i18n } = useNuxtApp();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: { path: string; message: string }[] = [];

    if (!input) {
        errors.push({ path: 'email', message: $i18n.t('email-policy-required') })
    } else if (!emailRegex.test(input)) {
        errors.push({ path: 'email', message: $i18n.t('email-policy-invalid') })
    }

    return errors;
}

 export function isValidInternalEmail(input: InputEmail) {
    const { $i18n } = useNuxtApp();
    const errors: { path: string; message: string }[] = [];
    const internalDomainList = getInternalDomainList();

    if (internalDomainList.some(domain => input.includes(domain))) {
        errors.push({ path: 'email', message: $i18n.t('email-policy-is-themallgroup', {atSignSymbol: '@'}) })
    }

    return errors;
 }