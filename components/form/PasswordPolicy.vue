<script setup lang="ts">
const form = useFormStore();

interface ValidatePassword {
    path: string;
    message?: string;
}

const props = defineProps<{
    validatePassword: ValidatePassword[];
    style: Record<string, any>;
}>();

</script>

<template>
    <div class="text-xs flex flex-col justify-center transition-all duration-300 ease-in-out overflow-hidden" :style="style">
        <div v-if="form.passwordPolicy.RequireLowercase" class="flex items-center gap-1">
            <p
                :class="props.validatePassword.some(error => error.message === 'Password must contain a lower case letter') ? 'text-red-500' : 'text-green-500'">
                <UIcon :name="props.validatePassword.some(error => error.message === 'Password must contain a lower case letter')
                    ? 'i-heroicons-x-mark-20-solid'
                    : 'i-heroicons-check-20-solid'
                    " class="w-4 text-sm" />
            </p>
            {{ $t('password-policy-lowercase') }}
        </div>
        <div v-if="form.passwordPolicy.RequireUppercase" class="flex items-center gap-1">
            <p
                :class="props.validatePassword.some(error => error.message === 'Password must contain an upper case letter') ? 'text-red-500' : 'text-green-500'">
                <UIcon :name="props.validatePassword.some(error => error.message === 'Password must contain an upper case letter')
                    ? 'i-heroicons-x-mark-20-solid'
                    : 'i-heroicons-check-20-solid'
                    " class="w-4 text-sm" />
            </p>
            {{ $t('password-policy-uppercase') }}
        </div>
        <div v-if="form.passwordPolicy.RequireNumbers" class="flex items-center gap-1">
            <p
                :class="props.validatePassword.some(error => error.message === 'Password must contain a number') ? 'text-red-500' : 'text-green-500'">
                <UIcon :name="props.validatePassword.some(error => error.message === 'Password must contain a number')
                    ? 'i-heroicons-x-mark-20-solid'
                    : 'i-heroicons-check-20-solid'
                    " class="w-4 text-sm" />
            </p>
            {{ $t('password-policy-number') }}
        </div>
        <div class="flex items-center gap-1">
            <p
                :class="props.validatePassword.some(error => error.message === `Password must contain at least ${form.passwordPolicy.MinimumLength} characters`) ? 'text-red-500' : 'text-green-500'">
                <UIcon :name="props.validatePassword.some(error => error.message === `Password must contain at least ${form.passwordPolicy.MinimumLength} characters`)
                    ? 'i-heroicons-x-mark-20-solid'
                    : 'i-heroicons-check-20-solid'
                    " class="w-4 text-sm" />
            </p>
            {{ $t('password-policy-length', { length: form.passwordPolicy.MinimumLength }) }}
        </div>
        <div v-if="form.passwordPolicy.RequireSymbols" class="flex items-center gap-1">
            <p
                :class="props.validatePassword.some(error => error.message === 'Password must contain a special character or a space') ? 'text-red-500' : 'text-green-500'">
                <UIcon :name="props.validatePassword.some(error => error.message === 'Password must contain a special character or a space')
                    ? 'i-heroicons-x-mark-20-solid'
                    : 'i-heroicons-check-20-solid'
                    " class="w-4 text-sm" />
            </p>
            {{ $t('password-policy-symbol') }}
        </div>
        <div class="flex items-center gap-1">
            <p
                :class="props.validatePassword.some(error => error.message === 'Password must not contain a leading or trailing space') ? 'text-red-500' : 'text-green-500'">
                <UIcon :name="props.validatePassword.some(error => error.message === 'Password must not contain a leading or trailing space')
                    ? 'i-heroicons-x-mark-20-solid'
                    : 'i-heroicons-check-20-solid'
                    " class="w-4 text-sm" />
            </p>
            {{ $t("password-policy-not-space-leading-trailing") }}
        </div>
        <slot name="list"/>
    </div>
</template>