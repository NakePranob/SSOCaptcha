<script setup lang="ts">
import { showCaptcha } from '~/utils/captcha/show-captcha';
import { useI18n } from 'vue-i18n'
declare global {
    interface Window {
        AwsWafIntegration: {
            getToken(): Promise<string>;
            hasToken(): boolean;
            fetch(url: string, options?: RequestInit): Promise<Response>;
        },
        AwsWafCaptcha: {
            renderCaptcha(container: HTMLElement, options: any): void;
        }
    }
}

// runtime config
const runtimeConfig = useRuntimeConfig();

// i18n
const { locale, setLocale, getLocaleCookie } = useI18n();

// use stores
const global = useGlobalStore();
const auth = useAuthStore();
const form = useFormStore();
const element = useElementStore();
const route = useRoute()
const currentPath = route.path

// Ref variable
const bodyHeight = ref();
const lang = ref(locale.value as 'en' | 'th')
const captchaContainer = ref<HTMLElement | null>(null);
const isCaptchaOpen = ref<boolean>(false);

const setIsCaptchaOpen = (value: boolean) => {
    isCaptchaOpen.value = value;
}

watch(lang, (newlang, Oldlang) => {
    setLocale(newlang)
})

onMounted(async () => {
    const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
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
        throw new Error('test');

        const AwsWafIntegration = window.AwsWafIntegration;
        // Handle WAF integration
        if (!AwsWafIntegration) {
            throw new Error('AWS WAF Integration failed to load');
        }

        console.log('AwsWafIntegration => ', AwsWafIntegration);

        const hasToken = await AwsWafIntegration.hasToken();
        console.log('hasToken => ', hasToken);
        if (!hasToken) {
            await AwsWafIntegration.getToken();
        }
    } catch (error) {
        console.log('error => ', error);

        const onSuccess = (token: string) => {
            isCaptchaOpen.value = false;
            console.log('onSuccess => ', token);
        }

        // Set isCaptchaOpen first so the modal opens and renders the container
        isCaptchaOpen.value = true;

        // Wait for next tick so the modal and container are in the DOM
        await nextTick();

        // Wait another tick to ensure container is fully rendered
        await nextTick(); 

        console.log('captchaContainer.value => ', captchaContainer.value);

        if (captchaContainer.value) {
            showCaptcha(captchaContainer.value, onSuccess);
            console.log('isCaptchaOpen.value => ', isCaptchaOpen.value);
        } else {
            console.error('Captcha container not found in DOM after modal open');
        }
    }
});

onMounted(() => {
    bodyHeight.value = document.body.clientHeight
});

const { pending, error } = useAsyncData("policy", async () => {
    if (!currentPath.includes('logout')) {
        const csrf = await $fetch<{ token: string }>(`${runtimeConfig.public.apiBase}/api/v1/auth/csrf-token`, {
            credentials: 'include',
        });
        if (csrf) {
            auth.setCSRF(csrf?.token)
        }

        const res = await $fetch<{
            password: {
                MinimumLength: number;
                RequireUppercase: boolean;
                RequireLowercase: boolean;
                RequireSymbols: boolean;
                RequireNumbers: boolean;
                TemporaryPasswordValidityDays: number;
            },
            global: MAuthenConfiguration;
        }>(`${runtimeConfig.public.apiBase}/api/v1/auth/policy`);

        if (res.password) {
            form.setPasswordPolicy({
                MinimumLength: res.password.MinimumLength,
                RequireUppercase: res.password.RequireUppercase,
                RequireLowercase: res.password.RequireLowercase,
                RequireSymbols: res.password.RequireSymbols,
                RequireNumbers: res.password.RequireNumbers,
            });

            global.setConfig(res.global);

            let height = 18 * 2;
            if (res.password.MinimumLength > 0) height += 18;
            if (res.password.RequireUppercase) height += 18;
            if (res.password.RequireLowercase) height += 18;
            if (res.password.RequireSymbols) height += 18;
            if (res.password.RequireNumbers) height += 18;
            element.setPasswordPolicyHeight(height);
        }

        return res;
    } else {
        return true
    }
});

</script>


<template>
    <div class="h-full dark:bg-[#141418] text-[#231F20] dark:text-slate-50 max-w-screen">
        <div class="grid grid-cols-10">
            <div class="fixed top-4 items-center right-4 flex gap-2 z-50">
                <!-- Theme -->
                <button class="flex justify-center items-center me-2">
                    <template v-if="$colorMode.value === 'dark'">
                        <UTooltip :text="$t('switch-to-ligth')" :open-delay="300">
                            <UIcon name="i-heroicons-moon-solid" class="rounded-full sm:w-8 sm:h-8 h-8 w-8" @click.stop="() => {
                                $colorMode.preference = 'light'
                            }" />
                        </UTooltip>
                    </template>
                    <template v-else-if="$colorMode.value === 'light'">
                        <UTooltip :text="$t('switch-to-system')" :open-delay="300">
                            <UIcon name="i-heroicons-sun-solid" class="rounded-full sm:w-8 sm:h-8 h-8 w-8" @click.stop="() => {
                                $colorMode.preference = 'dark'
                            }" />
                        </UTooltip>
                    </template>
                </button>
                <!-- Language -->
                <button class="flex justify-center items-center">
                    <template v-if="getLocaleCookie() === 'en'">
                        <UTooltip text="เปลี่ยนเป็นภาษาไทย" :open-delay="300">
                            <img class="rounded-full sm:w-8 sm:h-8 h-8 w-8" src="/img/flag-th.jpg"
                                @click.stop="setLocale('th')" loading="lazy" />
                        </UTooltip>
                    </template>
                    <template v-else>
                        <UTooltip text="Switch to English" :open-delay="300">
                            <img class="rounded-full sm:w-8 sm:h-8 h-8 w-8" src="/img/flag-en.png"
                                @click.stop="setLocale('en')" loading="lazy" />
                        </UTooltip>
                    </template>
                </button>
            </div>
            <!-- Left Section: Background Image -->
            <div class="hidden lg:block lg:col-span-6 h-screen relative">
                <img src="/img/bg.jpg" class="w-full h-full object-cover" alt="Background Image" loading="lazy" />
                <img src="/img/logo-banner.png" class="absolute object-fill left-1/2 top-8 -translate-x-1/2 h-96"
                    alt="logoBaner" loading="lazy" />
                <img src="/img/banner.png" class=" absolute top-16 h-[72px] left-1/2 -translate-x-1/2" alt="baner"
                    loading="lazy" />
                <img src="/img/city.png" class="absolute bottom-20 left-0 w-full" alt="city" loading="lazy" />
                <img src="/img/member.png" class="absolute object-fill bottom-8 left-1/2 -translate-x-1/2 h-[316.5px]"
                    alt="member" loading="lazy" />
            </div>
            <!-- Right Section: Slot Content -->
            <div class="col-span-10 lg:col-span-4 h-screen">
                <template v-if="pending">
                    <div class="h-screen w-full flex justify-center items-center">
                        <UCircular size='40' color='#E91C21' />
                    </div>
                </template>
                <template v-else-if="!auth.getClientId && !route.path.includes('logout')">
                    <div class="h-screen w-full flex justify-center items-center">
                        <ErrorPage title="oops" />
                    </div>
                </template>
                <template v-else>
                    <div class="h-screen w-full">
                        <slot />
                    </div>
                </template>
            </div>
            <UNotifications>
                <template #title="{ title }">
                    <span class="font-base" v-html="title" />
                </template>

                <template #description="{ description }">
                    <span class="font-base" v-html="description" />
                </template>
            </UNotifications>
        </div>
        <UModal v-model="isCaptchaOpen" prevent-close>
            <div class="px-4 py-8 bg-white rounded-lg">
                <div ref="captchaContainer" class=""></div>
            </div>
        </UModal>
    </div>
</template>

<style scoped>
*,
.font-base {
    font-family: "Noto Sans Thai", serif !important;
}
</style>
