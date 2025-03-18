<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getCSRF } from '~/utils/csrf/get-token';
import { getPolicy } from '~/utils/policy/getPolicy';
import { showCaptcha, loadAwsWafCaptchaScript, loadAwsWafIntegrationScript, setWAFToken } from '~/utils/challage/waf-script';

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

watch(lang, (newLang) => {
    setLocale(newLang);
});

onMounted(async () => {
    try {
        await Promise.all([loadAwsWafIntegrationScript(), loadAwsWafCaptchaScript()]);
        try {
            throw new Error('no waf token')
            await setWAFToken();
        } catch (error) {
            console.error('Error getting WAF Token:', error);
            auth.setCaptchaIsShow(true);
            await nextTick();
            try {
                showCaptcha((token: string) => {
                    auth.setCaptchaIsShow(false);
                    auth.setWAFToken(token);
                });
            } catch (error) {
                console.error('Error showing captcha:', error);
            }
        }
    } catch (error) {
        console.error('Error loading AWS WAF scripts:', error);
    }
});

onMounted(() => {
    bodyHeight.value = document.body.clientHeight
});

const { pending, error } = useAsyncData("policy", async () => {
    if (!currentPath.includes('logout')) {
        const token = await getCSRF()
        if (token) {
            auth.setCSRF(token)
        }
    
        const { passwordPolicy, globalConfig } = await getPolicy();
        
        if (passwordPolicy) {
            form.setPasswordPolicy({
                MinimumLength: passwordPolicy.MinimumLength,
                RequireUppercase: passwordPolicy.RequireUppercase,
                RequireLowercase: passwordPolicy.RequireLowercase,
                RequireSymbols: passwordPolicy.RequireSymbols,
                RequireNumbers: passwordPolicy.RequireNumbers,
            });

            global.setConfig(globalConfig);

            let height = 18*2;
            if (passwordPolicy.MinimumLength > 0) height += 18;
            if (passwordPolicy.RequireUppercase) height += 18;
            if (passwordPolicy.RequireLowercase) height += 18;
            if (passwordPolicy.RequireSymbols) height += 18;
            if (passwordPolicy.RequireNumbers) height += 18;
            element.setPasswordPolicyHeight(height);
        }

        return true;
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
                <template v-else-if="!auth.getClientId && !route.path.includes('logout') || error">
                    <div class="h-screen w-full flex justify-center items-center">
                        <ErrorPage title="oops"/>
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
        <Captcha />
    </div>
</template>

<style scoped>
*,
.font-base {
    font-family: "Noto Sans Thai", serif !important;
}
</style>
