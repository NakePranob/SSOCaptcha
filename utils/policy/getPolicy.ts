export async function getPolicy(): Promise<{
    passwordPolicy: PasswordPolicyType;
    globalConfig: MAuthenConfiguration;
}> {
    const { password, global } = await $fetch<{
        password: PasswordPolicyType;
        global: MAuthenConfiguration;
    }>('/auth/policy');


    return {
        passwordPolicy: password,
        globalConfig: global,
    };
}