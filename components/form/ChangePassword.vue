<script setup lang="ts">
// import
import type { FormError, FormSubmitEvent } from '#ui/types'
import { validatePasswordPolicy } from '@/utils/validate/password-policy' 
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

// runtime config
const runtimeConfig = useRuntimeConfig();

// i18n
const { t } = useI18n();

// notification
const toast = useToast();

const AwsWafIntegration = window.AwsWafIntegration;
const pageView = usePageViewStore();
const form = useFormStore();
const element = useElementStore();
const auth = useAuthStore();
const alert = useAlert();

const formElement = ref<HTMLElement | null>(null);
const isPending = ref(false);
const validatePassword = ref<{
    path: string,
    message?: string,
}[]>([]);

const state = reactive({
    password: undefined,
    c_password: undefined,
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
        element.setFormChangePasswordHight(height); // ส่งค่า height ไปยัง store
    }
}

watch([() => state.password, () => state.c_password], () => {
    validate(state);
});

const passwordPolicyStyle = computed(() => ({
    maxHeight: state.password || state.c_password ? `${element.passwordPolicyHeight + 18}px` : '0',
    opacity: state.password || state.c_password ? '1' : '0',
    marginBottom: state.password || state.c_password ? '32px' : '0',
}));

const validate = (state: any): FormError[] => {
    const errors = []
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
            redirectUrl: string 
        }>(`${runtimeConfig.public.apiBase}/api/v1/auth/force-change-password${auth.getParams}`, {
            method: 'POST',
            headers: {
                'csrf-token': auth.csrf,
                'x-waf-token': wafToken,
            },
            body: {
                session: auth.changPassword.session,
                username: auth.changPassword.email,
                password: event.data.password,
            },
            credentials: 'include',
        });

        if (error.value) {
            console.error("Error message from server:", error || "Unknown error occurred");
            if (error.value.data.code === 'MISSING_REQUIRED_FIELDS_EXCEPTION') {
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
                countdown: 3,
                url: data.value?.redirectUrl,
                title: 'noti-success-password-change-title',
                description: 'noti-success-password-change-description',
            })
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        toast.add({ title: t('noti-not-connect-api'), icon: "i-heroicons-x-circle" });
    } finally {
        isPending.value = false;
    }
}
</script>

<template>
    <div ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center">
        <Logo/>
        <div class="flex flex-col justify-center gap-2 mt-10 mb-8 w-full">
            <h1 class="text-[32px] font-bold text-primary-app dark:text-primary-app-400">{{ $t('force-change-password-title')
                }}</h1>
            <p class="text-base">
                {{ $t('force-change-password-description') }}
            </p>
        </div>
        <UForm :validate="validate" :state="state" class="space-y-4 w-full" @submit="onSubmit">
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
                <UButton :leading="isPending" type="submit" block size="xl" :padded="false" :ui="{
                    font: '!text-base',
                }" class="dark:text-slate-100 py-4">
                    <template v-if="isPending" #leading>
                        <UCircular size="16" color="white" />
                    </template>
                    {{ $t('continue-button') }}
                </UButton>
            </div>
        </UForm>
        <div class="mt-10 flex flex-col items-center justify-center gap-1 text-base">
            <span @click="pageView.setNextPage('')"
                class="font-bold flex gap-2 hover:gap-4 transition-all duration-300 ease-in-out cursor-pointer">
                <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" /> {{ $t('back-to-sign-in') }}
            </span>
        </div>
    </div>
</template>