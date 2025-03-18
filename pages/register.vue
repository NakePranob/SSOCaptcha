<script setup lang="ts">
import sleep from '@/utils/sleep';
const pageView = usePageViewStore();
const element = useElementStore();
const bodyHeight = ref();

const page1 = ref<HTMLElement | null>(null);
const page2 = ref<HTMLElement | null>(null);
const page3 = ref<HTMLElement | null>(null);

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
            page3.value?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            break;
        case 'codeVerification':
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
            v-if="pageView.nextPage === '' || pageView.nowPage ==='' || (pageView.nowPage !== 'codeVerification' && pageView.nowPage !== 'alert')"
            ref="page1" 
            class="min-w-full h-screen flex overflow-y-auto scrollbar-hidden justify-center snap-center snap-always px-4"
            :class="{
                'items-start py-8': element.formRegisterHight >= bodyHeight,
                'items-center': element.formRegisterHight < bodyHeight
            }"
        >
            <FormRegister/>
        </div>
        <div 
            v-if="pageView.nextPage === 'codeVerification' || pageView.nowPage ==='codeVerification'"
            ref="page2" 
            class="min-w-full h-screen flex overflow-y-auto scrollbar-hidden justify-center snap-center snap-always px-4"
            :class="{
                'items-start py-8': element.formVerifyCodeEmailHight >= bodyHeight,
                'items-center': element.formVerifyCodeEmailHight < bodyHeight
            }"
        >
            <FormVerifyCodeEmail/>
        </div>
        <div 
            v-if="pageView.nextPage === 'alert' || pageView.nowPage ==='alert'" 
            ref="page3" 
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
/* width */
.scrollbar-hidden::-webkit-scrollbar {
  display: hidden;
}
</style>