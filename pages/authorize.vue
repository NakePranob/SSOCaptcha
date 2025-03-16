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

const AwsWafIntegration = window.AwsWafIntegration;
const runtimeConfig = useRuntimeConfig();
const auth = useAuthStore();

definePageMeta({ layout: false })

onMounted(() => {
    const script = document.createElement('script')
    script.src = runtimeConfig.public.AWS_WAF_INTEGRATION_ENDPOINT
    script.defer = true
    script.onload = async () => {
        if (AwsWafIntegration) {
            const hasToken = await AwsWafIntegration.hasToken()
            if (!hasToken) {
                const token = await AwsWafIntegration.getToken()
                if (token) {
                    window.location.href = `${runtimeConfig.public.apiBase}/api/v1/auth/authorize${auth.getParams}`;
                }
            }
        }
    }
    document.head.appendChild(script)
})
</script>