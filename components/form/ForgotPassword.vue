<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useI18n } from 'vue-i18n'
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const AwsWafIntegration = window.AwsWafIntegration;
const INTERNAL_DOMAIN_LIST = useGlobalStore().config?.INTERNAL_DOMAIN_LIST ?? [];
const auth = useAuthStore();
const element = useElementStore();
const pageView = usePageViewStore();
const toast = useToast();

const formElement = ref<HTMLElement | null>(null);
const isPending = ref<boolean>(false);

const schema = z.object({
    email: z
        .string({ message: t('email-policy-required') })
        .trim()
        .email(t('email-policy-invalid'))
        .refine((email) => !INTERNAL_DOMAIN_LIST.some((domain) => email.includes(domain)),
            {
                message: t('email-policy-is-themallgroup', { atSignSymbol: '@' }),
            }
        )
})

type Schema = z.output<typeof schema>

const state = reactive({
    email: "",
})

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

        // Call forgot password API
        const { data, error } = await useFetch<{
            message: string;
            session_id: string;
        }>(`${runtimeConfig.public.apiBase}/api/v1/auth/forgot-password${auth.getParams}`, {
            method: 'POST',
            headers: {
                'csrf-token': auth.csrf,
                'x-waf-token': wafToken
            },
            body: {
                username: event.data.email,
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
                email: event.data.email,
                sessionId: data.value.session_id,
                reference: data.value.session_id.slice(-6).replace("_","M").replace("-","M").toUpperCase()
            });
            pageView.setNextPage('resetPassword')
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
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
        element.setFormForgotPasswordHight(height); // ส่งค่า height ไปยัง store
    }
}
</script>

<template>
    <div ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center space-y-8">
        <Logo/>
        <div class="flex flex-col justify-center gap-2 pt-4 w-full">
            <h1 class="text-[32px] font-bold text-primary-app dark:text-primary-app-400">{{ $t('forgot-password-title') }}</h1>
            <p class="text-base">
                {{ $t('forgot-password-description') }}
            </p>
        </div>
        <UForm :schema="schema" :state="state" class="space-y-8 w-full" @submit="onSubmit">
            <UFormGroup name="email">
                <UInput v-model="state.email" size="xl" :placeholder="$t('email-address')" />
            </UFormGroup>
            <UButton :loading="isPending" type="submit" block size="xl" :padded="false" :ui="{ font: '!text-base' }"
                class="dark:text-slate-100 py-4">
                <template v-if="isPending" #leading>
                    <UCircular size="16" color="white" />
                </template>
                {{ $t('continue-button') }}
            </UButton>
        </UForm>
        <div class="mt-10 flex flex-col items-center justify-center gap-1 text-base">
            <NuxtLink @click="pageView.setPage('')" :to="`/login${auth.getParams}`"
                class="font-bold flex gap-2 items-center">
                <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" /> {{ $t('back-to-sign-in') }}
            </NuxtLink>
        </div>
    </div>
</template>