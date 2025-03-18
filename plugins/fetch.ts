export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook("app:created", () => {
        const auth = useAuthStore();
        const { public: { apiBase } } = useRuntimeConfig();
        globalThis.$fetch = $fetch.create({
            baseURL: `${apiBase}/api/v1`,
            onRequest({ options }) {
                const headers = new Headers(options.headers as HeadersInit);
                if (auth.csrf) {
                    headers.set('csrf-token', auth.csrf);
                }
                if (auth.wafToken) {
                    headers.set('x-waf-token', auth.wafToken);
                }
                options.headers = headers;
            },
            credentials: 'include',
        });
    });
});