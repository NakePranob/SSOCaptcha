<script setup lang="ts">
// import
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useI18n } from 'vue-i18n'

const AwsWafIntegration = window.AwsWafIntegration;
// i18n 
const runtimeConfig = useRuntimeConfig();
const { t } = useI18n();
const toast = useToast();

// use stores
const OTP_CODE_LENGTH = useGlobalStore().config?.OTP_CODE_LENGTH ?? 6;
const auth = useAuthStore();
const countdown = useCountdownStore();
const element = useElementStore();
const pageView = usePageViewStore();
const alert = useAlert();

const formElement = ref<HTMLElement | null>(null);
const isPending = ref<boolean>(false);

const schema = z.object({
    otp: z
        .string({ message: t('otp-policy-required') })
        .min(
            OTP_CODE_LENGTH, 
            t('otp-policy-length', {length: OTP_CODE_LENGTH})
        ),
});

type Schema = z.output<typeof schema>;

const state = reactive({
    otp: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (isPending.value) return;
    isPending.value = true;

    try {
        // Get WAF token
        let wafToken = '';
        if (AwsWafIntegration) {
            const hasToken = await AwsWafIntegration.hasToken();
            if (!hasToken) {
                wafToken = await AwsWafIntegration.getToken();
            } else {
                wafToken = await AwsWafIntegration.getToken();
            }
        }

        if (!wafToken) {
            toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            return;
        }
        
        const { data, error } = await useFetch<{
            redirectUrl: string;
        }>(`${runtimeConfig.public.apiBase}/api/v1/auth/respond-to-challenge${auth.getParams}`, {
            method: 'POST',
            headers: {
                'csrf-token': auth.csrf,
                'x-waf-token': wafToken,
            },
            body: {
                username: auth.otp.email,
                password: auth.otp.password,
                challenge_name: auth.otp.challengeName,
                session: auth.otp.session,
                challenge_responses: {
                    ANSWER: event.data.otp
                }
            },
            credentials: 'include',
        });

        if (error.value) {
            if (error.value.data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                toast.add({ title: t('noti-new-password-required-exception'), icon: "i-heroicons-x-circle" });
                auth.setChangPassword({
                    session: error.value.data.Session,
                    email: error.value.data.ChallengeParameters.userAttributes.email,
                });
                pageView.setNextPage('changePassword');
            } else {
                console.error('Error message from server:', error || 'Unknown error occurred');  
                if (error.value.data.code === 'MISSING_REQUIRED_FIELDS_EXCEPTION') {
                    toast.add({ title: t('noti-missing-required-exception'), icon: "i-heroicons-x-circle" });
                } else if (error.value?.data.code === "OTP_EXPIRED_EXCEPTION") {
                    toast.add({ title: t('noti-session-expired'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'USER_IS_DISABLED') {
                    toast.add({ title: t('noti-user-is-disabled'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'NOT_AUTHORIZED_EXCEPTION') {
                    toast.add({ title: t('noti-invalid-otp'), icon: "i-heroicons-x-circle" });
                } else if (error.value.data.code === 'USER_LAMBDA_VALIDATION_EXCEPTION') {
                    toast.add({ title: t('noti-user-lambda-validation-exception'), icon: "i-heroicons-x-circle" });
                } else {
                    toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
                }
            }
            return;
        }

        if (data.value) {
            pageView.setNextPage('alert');
            alert.setAlert({
                state: 'success',
                url: data.value.redirectUrl,
                countdown: 3,
                title: 'noti-success-sign-in-title',
                description: 'noti-success-sign-in-description'
            })
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
    }
}

// Resend OTP
async function resendOTP() {
    countdown.countDownNow()

    if (isPending.value) return;
    isPending.value = true;

    try {
        // Get WAF token
        let wafToken = '';
        if (AwsWafIntegration) {
            const hasToken = await AwsWafIntegration.hasToken();
            if (!hasToken) {
                wafToken = await AwsWafIntegration.getToken();
            } else {
                wafToken = await AwsWafIntegration.getToken();
            }
        }

        if (!wafToken) {
            toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            return;
        }

        const { data, error } = await useFetch<{
            challengeName: string,
            session: string,
        }>(`${runtimeConfig.public.apiBase}/api/v1/auth/login${auth.getParams}`, {
            method: 'POST',
            headers: {
                'csrf-token': auth.csrf,
                'x-waf-token': wafToken,
            },
            credentials: 'include',
            body: {
                username: auth.otp.email,
                password: auth.otp.password,
            },
        });

        if (error.value) {
            console.error('Error message from server:', error || 'Unknown error occurred');
            if (error.value.data.code === 'NOT_AUTHORIZED_EXCEPTION') {
                toast.add({ title: t('sign-in-noti-not-authorized-exception'), icon: "i-heroicons-x-circle" });
            } else if (error.value.data.code === 'MISSING_REQUIRED_FIELDS_EXCEPTION') {
                toast.add({ title: t('noti-missing-required-exception'), icon: "i-heroicons-x-circle" });
            } else if (error.value.data.code === 'INVALID_EMAIL_EXCEPIONT') {
                toast.add({ title: t('noti-invalid-email-exception'), icon: "i-heroicons-x-circle" });
            } else if (error.value.data.code === 'InvalidCSRFTokenException') {
                toast.add({ title: t('noti-invalid-csrf-token-exception'), icon: "i-heroicons-x-circle" });
            } else if (error.value.data.code === 'AUTHORIZED_FAILED') {
                toast.add({ title: t('noti-authentication-failed'), icon: "i-heroicons-x-circle" });
            } else {
                toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            }
            return;
        }

        if (data.value) {
            if (data.value.challengeName === 'CUSTOM_CHALLENGE') {
                auth.setOTP({
                    email: auth.otp.email,
                    password: auth.otp.password,
                    session: data.value.session,
                    reference: data.value.session.slice(-6).replace("_","M").replace("-","M").toUpperCase(),
                    challengeName: data.value.challengeName,
                });
                toast.add({ title: t('noti-resent-otp'), color:"green", icon:"i-heroicons-check-circle" });
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
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
        email.value = maskEmail(auth.otp.email ? auth.otp.email : 'noreply-mauthen@themall.co.th');
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
        element.setFormVerifyOTPHight(height); // ส่งค่า height ไปยัง store
    }
}

</script>

<template>
    <div ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center gap-y-4">
        <Logo/>
        <div class="flex flex-col justify-center gap-2 mt-6 mb-4 w-full">
            <h1 class="text-[32px] font-bold text-primary-app dark:text-primary-app-400">{{ $t('otp-verification-title')
                }}</h1>
            <p class="text-base">
                {{ $t('otp-verification-description-email') }}
                <b class="text-primary-app dark:text-primary-app-400 font-bold text-base mb-2">{{ email }}</b>
                <b class="pl-2">{{ `(Ref. ${auth.otp.reference || "CODE"})` }}</b>
            </p>
        </div>
        <UForm :schema="schema" :state="state" class="space-y-8 w-full" @submit="onSubmit">
            <UFormGroup name="otp">
                <label>
                    {{ $t('otp-verification-label') }}
                    <!-- {{ $t('otp-verification-label-leading') }} -->
                    <!-- <b>{{ `(Ref. ${auth.otp.reference || "CODE"})` }}</b> -->
                    <!-- {{ $t('otp-verification-label-trailing') }} -->
                </label>
                <UInput 
                    v-model="state.otp" 
                    size="xl" 
                    :placeholder="$t('otp-verification-placeholder')" 
                    :maxlength="OTP_CODE_LENGTH"
                    inputClass="text-center mt-1" 
                />
            </UFormGroup>
            <UFormGroup>
                <UButton 
                    :loading="isPending" 
                    type="submit" 
                    block 
                    size="xl" 
                    class="dark:text-slate-100"
                >
                    <template v-if="isPending" #leading>
                        <UCircular size="16" color="white" />
                    </template>
                    {{ $t('verify-button') }}
                </UButton>
            </UFormGroup>
        </UForm>
        <div class="mt-4 flex flex-col items-center justify-center text-base">
            <div class="flex-1 flex flex-col items-center justify-center gap-2">
                <span>{{ $t('did-not-receive', { value: 'OTP' }) }}</span>
                <template v-if="countdown.interval !== null">
                    <b class="text-primary-app dark:text-primary-app-400 font-bold">
                        {{ $t('resend-otp-in') }} {{ formattedTime }}
                    </b>
                </template>
                <template v-else>
                    <b @click="resendOTP" class="text-primary-app hover:scale-105 cursor-pointer 
                    transition-all duration-150 ease-in-out dark:text-primary-app-400 font-bold">
                        {{ $t('resend-otp') }}
                    </b>
                </template>
            </div>
        </div>
        <span @click="pageView.setNextPage('')" class="font-bold mt-2 flex gap-2 items-center cursor-pointer
        transition-all duration-150 ease-in-out hover:gap-4">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" /> {{ $t('back-to-sign-in') }}
        </span>
    </div>
</template>