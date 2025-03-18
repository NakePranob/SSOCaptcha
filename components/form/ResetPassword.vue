<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, FormError } from '#ui/types'
import { validatePasswordPolicy } from '@/utils/validate/password-policy'
import { isValidWAFToken } from '@/utils/challage/aws-waf-script';

const { t } = useI18n();

const OTP_CODE_LENGTH = useGlobalStore().config?.OTP_CODE_LENGTH ?? 6;
const auth = useAuthStore();
const countdown = useCountdownStore();
const form = useFormStore();
const element = useElementStore();
const pageView = usePageViewStore();
const alert = useAlert();
const toast = useToast();

const formElement = ref<HTMLElement | null>(null);
const isPending = ref<boolean>(false);
const validatePassword = ref<{
    path: string,
    message?: string,
}[]>([]);

const state = reactive({
    code: undefined,
    password: undefined,
    c_password: undefined,
})

watch([() => state.code, () => state.password, () => state.c_password], () => {
    validate(state);
});

const passwordPolicyStyle = computed(() => ({
    maxHeight: state.password || state.c_password ? `${element.passwordPolicyHeight + 18}px` : '0',
    opacity: state.password || state.c_password ? '1' : '0',
    marginBottom: state.password || state.c_password ? '32px' : '0',
}));

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.code) errors.push({ path: 'code', message: t('code-policy-required') })
    if (state.code.length < OTP_CODE_LENGTH) errors.push({ path: 'code', message: t('code-policy-length', {length: OTP_CODE_LENGTH}) })
    let errorsPassword = validatePasswordPolicy(state.password)
    if (state.password != state.c_password && state.password) {
        errorsPassword.push({ path: 'c_password', message: 'Password not match' })
    }
    if (!state.password) errors.push({ path: 'password', message: t('password-policy-required') })
    if (!state.c_password) errors.push({ path: 'c_password', message: t('confirm-password-policy-required') })

    if (errorsPassword.length > 0 && state.password) errors.push({ path: 'password', message: '' })

    validatePassword.value = errorsPassword;
    return errors
}

async function onSubmit(event: FormSubmitEvent<any>) {
    if (isPending.value) return;
    isPending.value = true;

    try {
        // Check WAF Token
        const isWAFTokenValid = await isValidWAFToken();
        if (!isWAFTokenValid) {
            toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            return;
        }
        
        // Send request to server
        const { data, error } = await useFetch<{
            redirectUrl: string;
        }>(`/auth/forgot-password${auth.getParams}`, {
            method: 'POST',
            body: {
                username: auth.forgotPassword.email,
                otp: event.data.code,
                session_id: auth.forgotPassword.sessionId,
                new_password: event.data.password,
            },
            credentials: 'include',
        });

        if (error.value) {
            console.error("Error message from server:", error || "Unknown error occurred");
            if (error.value?.data.code === "INVALID_CODE_EXCEPTION") {
                toast.add({ title: t('noti-invalid-code-exception'), icon: "i-heroicons-x-circle" });
            } else if (error.value?.data.code === "OTP_EXPIRED_EXCEPTION") {
                toast.add({ title: t('noti-session-expired'), icon: "i-heroicons-x-circle" });
            }  else if (error.value.data.code === "MISSING_REQUIRED_FIELDS_EXCEPTION") {
                toast.add({ title: t('noti-missing-required-exception'), icon: "i-heroicons-x-circle" });
            } else {
                toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            }
            return;
        }

        if (data.value) {
            pageView.setNextPage('alert');
            alert.setAlert({
                state: 'success',
                url: `/login${auth.getParams}`,
                countdown: 3,
                title: 'noti-success-password-change-title',
                description: 'noti-success-password-change-description' 
            })
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
    }
}

async function resendCode() {
    if (isPending.value) return;
    isPending.value = true;
    
    try {
        // Check WAF Token
        const isWAFTokenValid = await isValidWAFToken();
        if (!isWAFTokenValid) {
            toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            return;
        }
        
        // Send request to server
        const { data, error } = await useFetch<{
            message: string;
            session_id: string;
        }>(`/auth/forgot-password${auth.getParams}`, {
            method: 'POST',
            body: {
                username: auth.forgotPassword.email,
            },
            credentials: 'include',
        });

        if (error.value) {
            console.error("Error message from server:", error || "Unknown error occurred");
            toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            return;
        }

        if (data.value) {
            auth.setForgotPassword({
                email: auth.forgotPassword.email,
                sessionId: data.value.session_id,
                reference: data.value.session_id.slice(-6).replace("_","M").replace("-","M").toUpperCase()
            });
            toast.add({ title: t('noti-resent-code'), color:"green", icon:"i-heroicons-check-circle" });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
        countdown.countDownNow();
    }
}

// Countdown
const formattedTime = computed(() => {
    const minutes = Math.floor(countdown.timeLeft / 60).toString().padStart(2, '0')
    const seconds = (countdown.timeLeft % 60).toString().padStart(2, '0')
    return `${minutes} : ${seconds}`
})

const email = ref()
onMounted(() => {
    nextTick(() => {
        email.value = maskEmail(auth.forgotPassword.email ? auth.forgotPassword.email : 'noreply-mauthen@themall.co.th');
        countdown.countDownNow();
    });
});

onUnmounted(() => {
    countdown.clearCountdown();
});


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
        element.setFormResetPasswordHight(height); // ส่งค่า height ไปยัง store
    }
}
</script>

<template>
    <div ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center">
        <Logo/>
        <div class="flex flex-col justify-center gap-1 my-8 w-full">
            <h1 class="text-[32px] font-bold text-primary-app dark:text-primary-app-400">{{ $t('confirm-password-title')
                }}</h1>
            <p class="text-base">
                {{ $t('confirm-password-description-leading') }}
                <b class="text-primary-app dark:text-primary-app-400 font-bold">
                    {{ email }}
                </b>
                <b class="pl-2">{{ `(Ref. ${auth.forgotPassword.reference || "CODE"})` }}</b>
                {{ $t('confirm-password-description-trailing') }}
            </p>
        </div>
        <UForm :validate="validate" :state="state" class="space-y-4 w-full" @submit="onSubmit">
            <label>
                {{ $t('otp-verification-label') }}
                <!-- {{ $t('otp-verification-label-leading') }} -->
                <!-- <b>{{ `(Ref. ${auth.forgotPassword.reference || "CODE"})` }}</b> -->
                <!-- {{ $t('otp-verification-label-trailing') }} -->
            </label>
            <UFormGroup name="code">
                <UInput v-model="state.code" size="xl" :maxlength="OTP_CODE_LENGTH"
                    :placeholder="$t('confirm-password-placeholder')" />
            </UFormGroup>
            <UFormGroup name="password" class="relative">
                <UInput :placeholder="$t('password')" size="xl" v-model="state.password"
                    :type="form.typePassword ? 'password' : 'text'"
                    :color="validatePassword.length > 0 ? 'red' : undefined" />
                <span @click="form.toggleTypePassword"
                    class="cursor-pointer text-gray-500 absolute dark:text-gray-400 z-50 top-[19px] right-4 flex justify-center items-center">
                    <UIcon :name="form.typePassword
                        ? 'i-heroicons-eye-20-solid'
                        : 'i-heroicons-eye-slash-20-solid'
                        " class="w-5 h-5" />
                </span>
            </UFormGroup>
            <UFormGroup name="c_password" class="relative">
                <UInput :placeholder="$t('confirm-password')" size="xl" v-model="state.c_password"
                    :type="form.typePassword ? 'password' : 'text'"
                    :color="validatePassword.some(error => error.path === 'c_password') ? 'red' : undefined" />
                <span @click="form.toggleTypePassword"
                    class="cursor-pointer text-gray-500 absolute dark:text-gray-400 z-50 top-[19px] right-4 flex justify-center items-center">
                    <UIcon :name="form.typePassword
                        ? 'i-heroicons-eye-20-solid'
                        : 'i-heroicons-eye-slash-20-solid'
                        " class="w-5 h-5" />
                </span>
            </UFormGroup>
            <FormPasswordPolicy :style="passwordPolicyStyle" :validatePassword="validatePassword">
                <template #list>
                    <div class="flex items-center gap-1">
                        <p
                            :class="validatePassword.some(error => error.message === 'Password not match') ? 'text-red-500' : 'text-green-500'">
                            <UIcon :name="validatePassword.some(error => error.message === 'Password not match')
                                ? 'i-heroicons-x-mark-20-solid'
                                : 'i-heroicons-check-20-solid'
                                " class="w-4 text-sm" />
                        </p>
                        {{ $t("password-policy-not-match") }}
                    </div>
                </template>
            </FormPasswordPolicy>
            <div>
                <UButton :loading="isPending" type="submit" block size="xl" :padded="false" :ui="{
                    font: '!text-base',
                }" class="dark:text-slate-100 py-4">
                    <template v-if="isPending" #leading>
                        <UCircular size="16" color="white" />
                    </template>
                    {{ $t('continue-button') }}
                </UButton>
            </div>
        </UForm>
        <div class="mt-4 flex flex-col items-center justify-center text-base">
            <div class="flex-1 flex flex-col items-center justify-center gap-2">
                <span>{{ $t('did-not-receive', { value: 'OTP' }) }}</span>
                <template v-if="countdown.interval !== null">
                    <b class="text-primary-app dark:text-primary-app-400 font-bold">
                        {{ $t('resend-code-in') }} {{ formattedTime }}
                    </b>
                </template>
                <template v-else>
                    <b @click="resendCode" class="text-primary-app hover:scale-105 cursor-pointer 
                    transition-all duration-150 ease-in-out dark:text-primary-app-400 font-bold">
                        {{ $t('resend-code') }}
                    </b>
                </template>
            </div>
            <NuxtLink @click="pageView.setPage('')" :to="`/login${auth.getParams}`"
                class="font-bold mt-6 flex gap-2 hover:gap-4 transition-all duration-300 ease-in-out">
                <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" /> {{ $t('back-to-sign-in') }}
            </NuxtLink>
        </div>
    </div>
</template>