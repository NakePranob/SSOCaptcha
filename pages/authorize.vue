<template>
    <div class="flex justify-center items-center h-screen w-screen">
        <UCircular size='40' color='#E91C21' />
    </div>
</template>

<script lang="ts" setup>
interface Window {
    AwsWafIntegration: {
        getToken(): Promise<string>;
        hasToken(): boolean;
        fetch(url: string, options?: RequestInit): Promise<Response>;
    }
}

const runtimeConfig = useRuntimeConfig();
const auth = useAuthStore();

definePageMeta({ layout: false })

onMounted(async () => {
    const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    };

    // Load AWS WAF scripts
    await loadScript('https://a2e68e46b9da.edge.captcha-sdk.awswaf.com/a2e68e46b9da/jsapi.js');
    await loadScript(runtimeConfig.public.AWS_WAF_INTEGRATION_ENDPOINT);

    console.log('window => ', window);

    try {
        const AwsWafIntegration = window.AwsWafIntegration;

        // Handle WAF integration
        if (!AwsWafIntegration) {
            throw new Error('AWS WAF Integration failed to load');
        }

        console.log('AwsWafIntegration => ', AwsWafIntegration);

        const hasToken = await AwsWafIntegration.hasToken();
        console.log('hasToken => ', hasToken);
        if (!hasToken) {
            const token = await AwsWafIntegration.getToken();
            if (token) {
                window.location.href = `${runtimeConfig.public.apiBase}/api/v1/auth/authorize${auth.getParams}`
            }
        } else {
            window.location.href = `${runtimeConfig.public.apiBase}/api/v1/auth/authorize${auth.getParams}`
        }
    } catch (error) {
        console.error('Error during authorization:', error)
    }
});
</script>