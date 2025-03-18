<template>
    <div class="flex justify-center items-center h-screen w-screen">
        <UCircular size='40' color='#E91C21' />
    </div>
</template>

<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig();
const auth = useAuthStore();

definePageMeta({ layout: false })

onMounted(async () => {
    window.location.href = `${runtimeConfig.public.apiBase}/api/v1/auth/authorize${auth.getParams}`;
})
</script>