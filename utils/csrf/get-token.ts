export async function getCSRF(): Promise<string> {
    const { public: { apiBaseUrl } } = useRuntimeConfig();
    const csrf = await $fetch<{ token: string }>('/auth/csrf-token');
    return csrf.token;
}