<script setup lang="ts">
import sleep from '@/utils/sleep';

const global = useGlobalStore();
const pageView = usePageViewStore();
const element = useElementStore();
const bodyHeight = ref();

const page1 = ref<HTMLElement | null>(null);
const page2 = ref<HTMLElement | null>(null);
const page3 = ref<HTMLElement | null>(null);
const page4 = ref<HTMLElement | null>(null);

watch(
    () => pageView.nextPage,
    (newPageView, oldPageView) => {
        scrollTo(newPageView);
    }
);

const scrollTo = async (page: string) => {
    await nextTick();
    switch (page) {
        case 'alert':
            page4.value?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            break;
        case 'changePassword':
            page3.value?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            break;
        case 'otp':
            page2.value?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            break;
        default:
            page1.value?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            break;
    }
    await sleep(500);
    pageView.setNowPage(page);
};

onMounted(() => {
    const updateBodyHeight = () => {
        bodyHeight.value = document.body.clientHeight;
    };

    updateBodyHeight();

    window.addEventListener('resize', updateBodyHeight);

    onBeforeUnmount(() => {
        window.removeEventListener('resize', updateBodyHeight);
    });
});
</script>

<template>
    <div class="w-full h-screen overflow-y-hidden overflow-x-auto snap-x snap-mandatory flex scrollbar-hidden">
        <div
            v-if="pageView.nextPage === '' || pageView.nowPage ==='' || (pageView.nowPage !== 'otp' && pageView.nowPage !== 'changePassword' && pageView.nowPage !== 'alert')"
            ref="page1" 
            class="min-w-full h-screen flex overflow-y-auto scrollbar-hidden justify-center snap-center snap-always px-4"
            :class="{
                'items-start py-8': element.formLoginHight > bodyHeight,
                'items-center': element.formLoginHight < bodyHeight
            }"
        >
            <FormLogin/>
        </div>
        <div 
            v-if="
                pageView.nextPage === 'otp' || pageView.nowPage ==='otp'
                && global.config?.['2FA_ENABLED'] 
                && global.config?.['2FA_ENABLED'] === 'ON'" 
            ref="page2" 
            class="min-w-full h-screen flex overflow-y-auto scrollbar-hidden justify-center snap-center snap-always px-4"
            :class="{
                'items-start py-8': element.formVerifyOTPHight >= bodyHeight,
                'items-center': element.formVerifyOTPHight < bodyHeight
            }"
        >
            <FormVerifyOTP/>
        </div>
        <div 
            v-if="pageView.nextPage === 'changePassword' || pageView.nowPage ==='changePassword'"
            ref="page3" 
            class="min-w-full h-screen flex overflow-y-auto scrollbar-hidden justify-center snap-center snap-always px-4"
            :class="{
                'items-start py-8': element.formChangePasswordHight >= bodyHeight,
                'items-center': element.formChangePasswordHight < bodyHeight
            }"
        >
            <FormChangePassword/>
        </div>
        <div 
            v-if="pageView.nextPage === 'alert' || pageView.nowPage ==='alert'" 
            ref="page4" 
            class="min-w-full h-screen flex overflow-y-auto scrollbar-hidden justify-center snap-center snap-always px-4"
            :class="{
                'items-start py-8': element.formAlertHight >= bodyHeight,
                'items-center': element.formAlertHight < bodyHeight
            }"
        >
            <FormAlertPage/>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: hidden;
}
</style>