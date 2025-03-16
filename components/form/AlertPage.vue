<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';

const { getLocaleCookie } = useI18n();
const currentLocale = computed(() => getLocaleCookie() || 'en');

const auth = useAuthStore();
const pageView = usePageViewStore();
const alert = useAlert();
const element = useElementStore();

const formElement = ref<HTMLElement | null>(null);
const isNoti = ref(false);
const second = ref(3);

onMounted(() => {
    nextTick(() => {
        countdown(alert.data?.countdown || 0);
    });
})  

const intervalId = ref<ReturnType<typeof setInterval> | null>(null);

function countdown(seconds: number) {
    second.value = seconds;
    if (intervalId.value) clearInterval(intervalId.value); // เคลียร์ interval เดิมก่อนเริ่มใหม่
    intervalId.value = setInterval(() => {

        second.value--;

        if (second.value <= 0) {
            clearInterval(intervalId.value!);
            intervalId.value = null;
            if (!alert.data?.url?.includes("http")) pageView.setNextPage('');
            isNoti.value = false;
            if (alert.data?.url) {
                if (intervalId.value !== null) clearInterval(intervalId.value);
                intervalId.value = null;
                navigateTo(
                    alert.data.url, 
                    { external: alert.data.url.includes("http") }
                );
            }
        }
    }, 1000);
}

onUnmounted(() => {
    if (intervalId.value) {
        clearInterval(intervalId.value);
        intervalId.value = null;
    }
});

function skip() {
    second.value = 0
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
        element.setFormAlertHeight(height); // ส่งค่า height ไปยัง store
    }
}
</script>

<template>
    <div v-if="alert.data" ref="formElement" class="max-w-[420px] w-full flex flex-col items-center justify-center space-y-8">
        <img :src="alert.data?.state === 'success' ? '/img/check.png' : '/img/error.png'" class="w-28 icon-animetion" />
        <div class="flex flex-col items-center justify-center">
            <h1 class="text-[32px] font-bold">
                {{ $t(alert.data?.title) }}
            </h1>
            <span :class="alert.data?.state === 'success' ? 'text-base mt-2 text-center' : 'text-sm mt-2 text-center whitespace-nowrap'">
                {{ $t(alert.data?.description ?? '') }}
            </span>
        </div>
        <div v-if="alert.data?.countdown && alert.data?.countdown > 0" class="flex flex-col items-center justify-center">
            <div class="pb-8">
                <UCircular size="24" color="#E91C21" />
            </div>
            <span class="text-base">
                {{ $t('noti-redirecting-in') }} {{ second > 0 ? second : '...' }}
            </span>
        </div>
        <div class="w-full" :class="{'pt-6': alert.data?.state === 'error'}">
            <UButton @click="skip" block size="xl" :padded="false" :ui="{ font: '!text-base' }" class="dark:text-slate-100 py-4">
                <template v-if="alert.data?.state === 'success'">
                    {{ $t('noti-success-button') }}
                </template>
                <template v-else>
                    {{ $t('noti-error-button') }}
                </template>
            </UButton>
        </div>
        <template v-if="alert.data?.state === 'error'">
            <NuxtLink @click="pageView.setNextPage('')" :to="`/login${auth.getParams}`" class="font-bold flex gap-2 hover:gap-4 transition-all duration-300 ease-in-out pt-2">
                <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" /> {{ $t('back-to-sign-in') }}
            </NuxtLink>
        </template>
    </div>
</template>

<style scoped>
@keyframes icon-animetion {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.icon-animetion {
  animation: icon-animetion 1s ease-in-out 1;
}
</style>