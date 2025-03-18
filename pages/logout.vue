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
        await nextTick();
        if (auth.wafToken) {
            navigateTo(`${runtimeConfig.public.apiBaseUrl}/auth/logout?client_id=${auth.getClientId}&logout_uri=${auth.getLogoutUri}`, { external: true});
        }
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
        <div v-else class="h-screen w-full flex justify-center items-center">
            <UCircular size='40' color='#E91C21' />
        </div>
    </div>
</template>