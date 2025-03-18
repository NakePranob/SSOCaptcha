<template>
    <div class="flex justify-center items-center h-screen w-screen">
        <UCircular size='40' color='#E91C21' />
    </div>
</template>

<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig();
const auth = useAuthStore();

definePageMeta({ layout: false })

const Navigate = () => {
    window.location.href = `${runtimeConfig.public.apiBase}/api/v1/auth/authorize${auth.getParams}`;
}

onMounted(async () => {
    try {
        await Promise.all([loadAwsWafIntegrationScript(), loadAwsWafCaptchaScript()]);
        try {
            await setWAFToken();
            Navigate();
        } catch (error) {
            console.error('Error getting WAF Token:', error);
            auth.setCaptchaIsShow(true);
            await nextTick();
            try {
                showCaptcha(async (token: string) => {
                    await sleep(3000);
                    auth.setCaptchaIsShow(false);
                    auth.setWAFToken(token);
                    Navigate();
                });
            } catch (error) {
                console.error('Error showing captcha:', error);
            }
        }
    } catch (error) {
        console.error('Error loading AWS WAF scripts:', error);
    }
});
</script>