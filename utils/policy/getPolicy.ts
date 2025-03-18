export async function getPolicy(): Promise<{
    passwordPolicy: PasswordPolicyType;
    globalConfig: MAuthenConfiguration;
}> {
    return await $fetch<{
        passwordPolicy: PasswordPolicyType;
        globalConfig: MAuthenConfiguration;
    }>('/auth/policy');
}