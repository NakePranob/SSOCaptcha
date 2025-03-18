<script lang="ts" setup>
import UCircular from './UCircular.vue';

const auth = useAuthStore();
</script>

<template>
    <UModal v-model="auth.captchaIsShow" prevent-close>
        <div class="px-4 min-h-96 py-8 bg-white rounded-lg relative">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <UCircular size="24" color="#E91C21" />
            </div>
            <div id="captcha-container"></div>
        </div>
    </UModal>
</template>