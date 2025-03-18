export async function getCSRF(): Promise<string> {
    const csrf = await $fetch<{ token: string }>('/auth/csrf-token');
    return csrf.token;
}