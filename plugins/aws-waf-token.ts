export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook("app:created", () => {
        const auth = useAuthStore();
        const { public: { apiBaseUrl } } = useRuntimeConfig();
        globalThis.$fetch = $fetch.create({
            baseURL: apiBaseUrl,
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