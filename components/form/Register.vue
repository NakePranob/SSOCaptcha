<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import { validatePasswordPolicy } from '@/utils/validate/password-policy'
import { validateEmail, isValidInternalEmail } from '@/utils/validate/email'
import { useI18n } from 'vue-i18n'

const AwsWafIntegration = window.AwsWafIntegration;
const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const { t } = useI18n();

const auth = useAuthStore();
const form = useFormStore();
const element = useElementStore();
const pageView = usePageViewStore();

const formElement = ref<HTMLElement | null>(null);
const validatePassword = ref<{
    path: string,
    message?: string,
}[]>([]);
const isPending = ref<boolean>(false);

const state = reactive({
    email: "",
    password: "",
})

watch([() => state.email, () => state.password], () => {
    state.email = toEmailFormatted(state.email);
    validate(state);
});

const passwordPolicyStyle = computed(() => ({
    maxHeight: state.password ? `${element.passwordPolicyHeight}px` : '0',
    opacity: state.password ? '1' : '0',
    marginBottom: state.password ? '32px' : '0',
}));

const validate = (state: any): FormError[] => {
    let errors = [];

    const errorEmail = validateEmail(state.email);
    const errorInternalEmail = isValidInternalEmail(state.email);

    if (!state.password) errors.push({ path: 'password', message: t('password-policy-required') })
    const errorsPassword = validatePasswordPolicy(state.password)

    if (errorsPassword.length > 0 && state.password) errors.push({ path: 'password', message: '' })

    errors = [...errorEmail, ...errorInternalEmail]

    validatePassword.value = errorsPassword;
    return errors
}

async function onSubmit(event: FormSubmitEvent<{
    email: string,
    password: string,
}>) {
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

        const formData = {
            username: event.data.email,
            password: event.data.password,
        }
        const { data, error } = await useFetch<{
            session_id: string,
            message: string,
        }>(`${runtimeConfig.public.apiBase}/api/v1/auth/register${auth.getParams}`, {
            method: "POST",
            headers: {
                'csrf-token': auth.csrf,
                'x-waf-token': wafToken,
            },
            body: formData,
            credentials: 'include',
        });

        if (error.value) {
            console.error("Error message from server:", error || "Unknown error occurred");
            if (error.value?.data.code === "USER_ALREADY_EXISTS_EXCEPION") {
                toast.add({ title: t('noti-user-already-exists-exception'), icon: "i-heroicons-x-circle" });
            } else if (error.value.data.code === 'MISSING_REQUIRED_FIELDS_EXCEPTION') {
                toast.add({ title: t('noti-missing-required-exception'), icon: "i-heroicons-x-circle" });
            } else {
                toast.add({ title: t('noti-unknown-exception'), icon: "i-heroicons-x-circle" });
            }
            return;
        }

        if (data.value) {
            auth.setCodeVerification({
                email: event.data.email,
                password: event.data.password,
                sessionId: data.value.session_id,
                reference: data.value.session_id.slice(-6).replace("_","M").replace("-","M").toUpperCase()
            });
            pageView.setNextPage('codeVerification');
        }
    } catch (err) {
        console.error("Unexpected error:", err);
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
        element.setFormRegisterHight(height); // ส่งค่า height ไปยัง store
    }
}
</script>

<template>
    <div ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center gap-y-4">
        <Logo/>
        <div class="flex flex-col justify-center gap-2 mt-6 w-full">
            <h1 class="text-[32px] font-bold text-primary-app dark:text-primary-app-400">{{ $t('sign-up-title') }}</h1>
            <p class="text-base">
                {{ $t('sign-up-description') }}
            </p>
        </div>
        <UForm :validate="validate" :state="state" class="space-y-4 w-full mt-4" @submit="onSubmit">
            <UFormGroup name="email">
                <UInput v-model="state.email" size="xl" :placeholder="$t('email')" />
            </UFormGroup>
            <UFormGroup class="relative" name="password">
                <UInput v-model="state.password" size="xl" :placeholder="$t('password')"
                    :type="form.typePassword ? 'password' : 'text'"/>
                <p @click="form.toggleTypePassword"
                    class="cursor-pointer text-gray-500 absolute dark:text-gray-400 z-50 top-[19px] right-4 flex justify-center items-center">
                    <UIcon :name="form.typePassword
                        ? 'i-heroicons-eye-20-solid'
                        : 'i-heroicons-eye-slash-20-solid'
                        " class="w-5 h-5" />
                </p>
            </UFormGroup>
            <FormPasswordPolicy :style="passwordPolicyStyle" :validatePassword="validatePassword"/>
            <UButton :loading="isPending" type="submit" block size="xl" :padded="false" :ui="{ font: '!text-base' }"
                class="dark:text-slate-100 py-4">
                <template v-if="isPending" #leading>
                    <UCircular size="16" color="white" />
                </template>
                {{ $t('sign-up-title') }}
            </UButton>
        </UForm>
        <div class="mt-4 w-full flex justify-center">
            <p class="text-base">
                {{ $t('already-have-account') }} 
                <NuxtLink @click="pageView.setPage('')" :to="`/login${auth.getParams}`"
                    class="text-primary-app dark:text-primary-app-400 font-bold">
                    {{ $t('sign-in-title') }}
                </NuxtLink>
            </p>
        </div>
    </div>
</template>