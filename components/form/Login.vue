<script setup lang="ts">
// import
import { isValidWAFToken } from '@/utils/challage/aws-waf-script';
import { validatePasswordPolicy } from '@/utils/validate/password-policy'
import { validateEmail, isValidInternalEmail } from '@/utils/validate/email'
import type { FormError, FormSubmitEvent } from '#ui/types'

const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

// use stores
const auth = useAuthStore();
const form = useFormStore();
const element = useElementStore();
const formElement = ref<HTMLElement | null>(null);
const pageView = usePageViewStore();
const alert = useAlert();

// Ref variable
const validatePassword = ref<{
    path: string,
    message?: string,
}[]>([]);
const isPending = ref<boolean>(false);

// Reactive variable
const state = reactive({
    email: '',
    password: '',
})

onMounted(() => {
    nextTick(() => {
        // เริ่มต้น ResizeObserver เมื่อ component ถูก mount
        const resizeObserver = new ResizeObserver(() => {
            getElementHeight();
        });

        if (formElement.value) {
            resizeObserver.observe(formElement.value);
        }

        onBeforeUnmount(() => {
            // หยุดการฟังเมื่อ component ถูก unmount
            if (formElement.value) {
                resizeObserver.unobserve(formElement.value);
            }
        });

        getElementHeight(); // เรียกใช้งานครั้งแรก
    })
})

const getElementHeight = () => {
    if (formElement.value) {
        const height = formElement.value.clientHeight;
        element.setFormLoginHight(height); // ส่งค่า height ไปยัง store
    }
}

watch([() => state.email, () => state.password], () => {
    state.email = toEmailFormatted(state.email);
    validate(state);
});

const validate = (state: any): FormError[] => {
    let errors = [];

    const errorEmail = validateEmail(state.email);

    if (!state.password) errors.push({ path: 'password', message: t('password-policy-required') });
    const errorsPassword = validatePasswordPolicy(state.password);

    errors = [...errorEmail];

    validatePassword.value = errorsPassword;
    return errors
}

const onSubmit = async (event: FormSubmitEvent<{
    email: string,
    password: string,
}>) => {
    if (isPending.value) return;
    isPending.value = true;

    if (validatePassword.value.length > 0) {
        toast.add({ title: t('sign-in-noti-not-authorized-exception'), icon: "i-heroicons-x-circle" });
        isPending.value = false;
        return;
    }

    try {
        // Check WAF Token
        const isWAFTokenValid = await isValidWAFToken();
        if (!isWAFTokenValid) {
            toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            return;
        }
        
        // Send request to server
        const { data, error } = await useFetch<{ 
            session?: string, challengeName?: string 
        } | {
            message?: string,
            redirectUrl?: string
        }>(`/auth/login${auth.getParams}`, {
            method: 'POST',
            credentials: 'include',
            body: {
                username: event.data.email,
                password: event.data.password,
            },
        });

        if (error.value) {
            console.error('Error message from server:', error || 'Unknown error occurred');
            if (error.value.data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                toast.add({ title: t('noti-new-password-required-exception'), icon: "i-heroicons-x-circle" });
                auth.setChangPassword({
                    session: error.value.data.Session,
                    email: error.value.data.ChallengeParameters.userAttributes.email,
                });
                pageView.setNextPage('changePassword');
            } else {
                if (error.value.data.code === 'NOT_AUTHORIZED_EXCEPTION') {
                    toast.add({ title: t('sign-in-noti-not-authorized-exception'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'USER_IS_DISABLED') {
                    toast.add({ title: t('noti-user-is-disabled'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'MISSING_REQUIRED_FIELDS_EXCEPTION') {
                    toast.add({ title: t('noti-missing-required-exception'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'INVALID_EMAIL_EXCEPIONT') {
                    toast.add({ title: t('noti-invalid-email-exception'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'InvalidCSRFTokenException') {
                    toast.add({ title: t('noti-invalid-csrf-token-exception'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'AUTHORIZED_FAILED') {
                    toast.add({ title: t('noti-authentication-failed'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'PASSWORD_RESET_REQUIRED_EXCEPTION') {
                    toast.add({ title: t('ต้องรีเซ็ตรหัสผ่านก่อนเข้าสู่ระบบ'), icon: "i-heroicons-x-circle" });
                    router.push(`/forgot-password${auth.getParams}`);
                } else {
                    toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
                }
            }
            return;
        }

        if (data.value) {
            if ('session' in data.value && data.value.session
                && 'challengeName' in data.value && data.value.challengeName) 
            {
                auth.setOTP({
                    email: event.data.email,
                    password: event.data.password,
                    session: data.value.session,
                    reference: data.value.session.slice(-6).replace("_","M").replace("-","M").toUpperCase(),
                    challengeName: data.value.challengeName,
                });
                pageView.setNextPage('otp');
            } else if ('redirectUrl' in data.value && data.value.redirectUrl) {
                pageView.setNextPage('alert');
                alert.setAlert({
                    state: 'success',
                    url: data.value.redirectUrl,
                    countdown: 3,
                    title: 'noti-success-sign-in-title',
                    description: 'noti-success-sign-in-description'
                })
            } else {
                throw new Error('Unexpected response format');
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
    }

};
</script>

<template>
    <div ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center gap-y-4">
       <Logo/>
       <div class="flex flex-col justify-center gap-2 mt-3 w-full">
            <h1 class="text-[32px] font-bold text-primary-app dark:text-primary-app-400">{{ $t('sign-in-title') }}</h1>
            <p class="text-base">
                {{ $t('sign-in-description') }}
            </p>
        </div>
        <UForm :validate="validate" :state="state" class="space-y-4 w-full" @submit="onSubmit">
            <div class="w-full">
                <p>{{  $t('sign-in-description-2')  }}</p>
            </div>
            <UFormGroup name="email">
                <UInput v-model="state.email" size="xl" :placeholder="$t('email')" />
            </UFormGroup>
            <UFormGroup name="password" class="relative">
                <UInput v-model="state.password" size="xl" :placeholder="$t('password')"
                    :type="form.typePassword ? 'password' : 'text'" />
                <span @click="form.toggleTypePassword"
                    class="cursor-pointer text-gray-500 absolute dark:text-gray-400 z-50 top-[19px] right-4 flex justify-center items-center">
                    <UIcon :name="form.typePassword
                        ? 'i-heroicons-eye-20-solid'
                        : 'i-heroicons-eye-slash-20-solid'
                        " class="w-5 h-5" />
                </span>
            </UFormGroup>
            <div class="text-base pb-2">
                <NuxtLink @click="pageView.setNextPage('')" :to="`/forgot-password${auth.getParams}`" class="cursor-pointer">
                    {{ $t('forgot-password') }}
                </NuxtLink>
            </div>
            <UButton :loading="isPending" type="submit" block size="xl"
                class="dark:text-slate-100">
                <template v-if="isPending" #leading>
                    <UCircular size="16" color="white" />
                </template>
                {{ $t('sign-in-title') }}
            </UButton>
        </UForm>
        <div class="w-full">
            <p class="text-center text-base">
                {{ $t('dont-have-account') }}
                <NuxtLink @click="pageView.setNextPage('')" :to="`/register${auth.getParams}`"
                    class="text-primary-app dark:text-primary-app-400 font-bold">
                    {{ $t('sign-in-sign-up-link') }}
                </NuxtLink>
            </p>
            <div class="px-8 w-full my-4">
                <UDivider :label="$t('or')" />
            </div>
            <p class="w-full my-2">{{ $t('sign-in-description-3') }}</p>
            <UButton 
                @click="() => {
                    navigateTo(
                        `${runtimeConfig.public.COGNITO_OAUTH2_ENDPOINT}/oauth2/authorize?` + [
                            `identity_provider=TMG-EntraID-2FA`,
                            `response_type=TOKEN`,
                            `client_id=${auth.getClientId}`,
                            `redirect_uri=${encodeURIComponent(auth.getRedirectUri)}`,
                        ].join('&'),
                        { external: true }
                    )
                }"
                type="submit" 
                block size="xl" 
                :padded="false" 
                :ui="{ font: '!text-base' }" 
                class=" text-primary-app dark:text-primary-app-400 font-bold py-4 bg-white/0 dark:bg-[#141418]
                    outline-1 outline-primary-app dark:outline-primary-app-400 ring-1 ring-primary-app 
                    dark:ring-primary-app-400 hover:text-slate-50 dark:hover:text-slate-50"
            >
                <template #leading>
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                        <title>MS-SymbolLockup</title>
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                </template>
                {{ 'TMG Single Sign-On' }}
            </UButton>
        </div>
        <p class="mt-2">
            {{ $t('thank-you-for-using') }}
        </p>
    </div>
</template>