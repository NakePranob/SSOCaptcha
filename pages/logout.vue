<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig();
const auth = useAuthStore();
const alert = useAlert();

onMounted(async () => {
    if (auth.getState === 'logout') {
        alert.setAlert({
            state: 'success',
            url: auth.getLogoutUri,
            countdown: 3,
            title: 'noti-success-logout-title',
            description: 'noti-success-logout-description'
        })
    } else {
        navigateTo(`${runtimeConfig.public.apiBase}/api/v1/auth/logout?client_id=${auth.getClientId}&logout_uri=${auth.getLogoutUri}`, { external: true});
    }
})
</script>

<template>
    <div class="w-full h-screen overflow-y-hidden flex">
        <div
            v-if="auth.getState === 'logout'"
            ref="page1" 
            class="min-w-full h-screen flex justify-center items-center snap-center snap-always px-4"
        >
            <FormAlertPage/>
        </div>
    </div>
</template>