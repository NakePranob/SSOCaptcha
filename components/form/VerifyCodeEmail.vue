<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const runtimeConfig = useRuntimeConfig();
const { t } = useI18n();

const OTP_CODE_LENGTH = useGlobalStore().config?.OTP_CODE_LENGTH ?? 6;
const auth = useAuthStore();
const countdown = useCountdownStore();
const form = useFormStore();
const element = useElementStore();
const pageView = usePageViewStore();
const toast = useToast();
const alert = useAlert();

const email = ref();
const formElement = ref<HTMLElement | null>(null);
const isPending = ref<boolean>(false);

const schema = z.object({
    code: z
        .string({ message: t('code-policy-required') })
        .min(
            OTP_CODE_LENGTH, 
            t('code-policy-length', {length: OTP_CODE_LENGTH})
        ),
})

type Schema = z.output<typeof schema>

const state = reactive({
    code: undefined,
})

// Countdown
const formattedTime = computed(() => {
  const minutes = Math.floor(countdown.timeLeft / 60).toString().padStart(2, '0')
  const seconds = (countdown.timeLeft % 60).toString().padStart(2, '0')
  return `${minutes} : ${seconds}`
})

onMounted(() => {
    nextTick(() => {
        email.value = maskEmail(auth.codeVerification.email ? auth.codeVerification.email : 'noreply-mauthen@themall.co.th');
        countdown.countDownNow();
    });
});

onUnmounted(() => {
    countdown.clearCountdown();
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (isPending.value) return;
    isPending.value = true;

    try {
        const { data, error } = await useFetch(`${runtimeConfig.public.apiBase}/api/v1/auth/register${auth.getParams}`, {
            method: 'POST',
            headers: {
                'csrf-token': auth.csrf
            },
            body: {
                username: auth.codeVerification.email,
                password: auth.codeVerification.password,
                otp: event.data.code,
                session_id: auth.codeVerification.sessionId,
            },
            credentials: 'include',
        });

        if (error.value) {
            console.error("Error message from server:", error || "Unknown error occurred");
            if (error.value?.data.code === "INVALID_CODE_EXCEPTION") {
                toast.add({ title: t('noti-invalid-code-exception'), icon: "i-heroicons-x-circle" });
            } else if (error.value?.data.code === "OTP_EXPIRED_EXCEPTION") {
                toast.add({ title: t('noti-session-expired'), icon: "i-heroicons-x-circle" });
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
                title: 'noti-success-sign-up-title',
                description: 'noti-success-sign-up-description' 
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
        const formData = {
            username: auth.codeVerification.email,
        }
        const { data, error } = await useFetch<{
            session_id: string,
            message: string,
        }>(`${runtimeConfig.public.apiBase}/api/v1/auth/resend-code-verify-email${auth.getParams}`, {
            method: "POST",
            headers: {
                'csrf-token': auth.csrf
            },
            body: formData,
            credentials: 'include',
        });

        if (error.value) {
            console.error("Error message from server:", error || "Unknown error occurred");
            toast.add({ title: error.value?.data.message || 'Unknown error occurred', icon: "i-heroicons-x-circle" });
            return;
        }

        if (data.value) {
            auth.setCodeVerification({
                email: auth.codeVerification.email,
                password: auth.codeVerification.password,
                sessionId: data.value.session_id,
                reference: data.value.session_id.slice(-6).replace("_","M").replace("-","M").toUpperCase()
            });
            toast.add({ title: t('noti-resent-code'), color:"green", icon:"i-heroicons-check-circle" });
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
        countdown.countDownNow();
    }
}

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
        element.setFormVerifyCodeEmailHight(height); // ส่งค่า height ไปยัง store
    }
}
</script>

<template>
    <div ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center">
        <Logo/>
        <div class="flex flex-col justify-center gap-2 my-8 w-full">
            <h1 class="text-[32px] font-bold text-primary-app dark:text-primary-app-400">{{
                $t('code-verification-title') }}</h1>
            <p class="text-base">
                {{ $t('code-verification-description') }}
                <b class="text-primary-app dark:text-primary-app-400 font-bold">
                    {{ email }}
                </b>
                <b class="pl-2">{{ `(Ref. ${auth.codeVerification.reference || "CODE"})` }}</b>
            </p>
        </div>
        <UForm :schema="schema" :state="state" class="space-y-8 w-full" @submit="onSubmit">
            <UFormGroup name="code">
                <label>
                    {{ $t('otp-verification-label') }}
                    <!-- {{ $t('otp-verification-label-leading') }} -->
                    <!-- <b>{{ `(Ref. ${auth.codeVerification.reference || "CODE"})` }}</b> -->
                    <!-- {{ $t('otp-verification-label-trailing') }} -->
                </label>
                <UInput 
                    v-model="state.code" 
                    size="xl" 
                    inputClass="text-center"
                    :maxlength="OTP_CODE_LENGTH"
                    :placeholder="$t('code-verification-placeholder')" 
                />
            </UFormGroup>
            <UButton 
                :loading="isPending" 
                type="submit" 
                block 
                size="xl" 
                :padded="false" 
                :ui="{ font: '!text-base' }"
                class="dark:text-slate-100 py-4"
            >
                <template v-if="isPending" #leading>
                    <UCircular size="16" color="white" />
                </template>
                {{ $t('verify-button') }}
            </UButton>
        </UForm>
        <div class="mt-8 flex flex-col items-center justify-center text-base">
            <div class="flex-1 flex flex-col items-center justify-center gap-2">
                <span>{{ $t('did-not-receive', { value: 'Code' }) }}</span>
                <template v-if="countdown.interval !== null">
                    <b class="text-primary-app dark:text-primary-app-400 font-bold">
                        {{ $t('resend-otp-in') }} {{ formattedTime }}
                    </b>
                </template>
                <template v-else>
                    <b @click="resendCode" class="text-primary-app hover:scale-105 cursor-pointer 
                    transition-all duration-150 ease-in-out dark:text-primary-app-400 font-bold">
                        {{ $t('resend-otp') }}
                    </b>
                </template>
            </div>
            <NuxtLink @click="pageView.setPage('')" :to="`/login${auth.getParams}`"
                class="font-bold mt-8 flex gap-2 items-center">
                <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" /> {{ $t('back-to-sign-in') }}
            </NuxtLink>
        </div>
    </div>
</template>