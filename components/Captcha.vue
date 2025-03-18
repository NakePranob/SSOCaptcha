<script lang="ts" setup>
import UCircular from './UCircular.vue';

const auth = useAuthStore();
</script>

<template>
    <UModal id="captcha-modal" v-model="auth.captchaIsShow" prevent-close>
        <div class="relative min-h-96 px-4 py-16 bg-white rounded-lg">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <UCircular size="24" color="#E91C21"/>
            </div>
            <div id="captcha-container" class="bg-white"></div>
        </div>
    </UModal>
</template>