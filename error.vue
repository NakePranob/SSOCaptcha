<script setup lang="ts">
const { locale, setLocale, getLocaleCookie } = useI18n();
const bodyHeight = ref();

const language = [{
    name: 'English',
    value: 'en'
}, {
    name: 'Thailand',
    value: 'th',
}]

const lang = ref(locale.value as 'en' | 'th')

watch(lang, (newlang, Oldlang) => {
    setLocale(newlang)
})

onMounted(() => {
    bodyHeight.value = document.body.clientHeight
});
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
    <div class="h-full dark:bg-zinc-950">
        <div class="grid grid-cols-10">
            <div class="fixed top-4 items-center right-4 flex gap-2">
                <!-- Theme -->
                <button class="flex justify-center items-center me-2">
                    <template v-if="$colorMode.value === 'dark'">
                        <UTooltip :text="$t('switch-to-ligth')" :open-delay="300">
                            <UIcon name="i-heroicons-moon-solid" class="rounded-full sm:w-8 sm:h-8 h-8 w-8" @click.stop="() => {
                                $colorMode.preference = 'light'
                            }" />
                        </UTooltip>
                    </template>
                    <template v-else-if="$colorMode.value === 'light'">
                        <UTooltip :text="$t('switch-to-system')" :open-delay="300">
                            <UIcon name="i-heroicons-sun-solid" class="rounded-full sm:w-8 sm:h-8 h-8 w-8" @click.stop="() => {
                                $colorMode.preference = 'dark'
                            }" />
                        </UTooltip>
                    </template>
                </button>
                <!-- Language -->
                <button class="flex justify-center items-center">
                    <template v-if="getLocaleCookie() === 'en'">
                        <UTooltip text="เปลี่ยนเป็นภาษาไทย" :open-delay="300">
                            <img class="rounded-full sm:w-8 sm:h-8 h-8 w-8" src="/img/flag-th.jpg"
                                @click.stop="setLocale('th')" loading="lazy" />
                        </UTooltip>
                    </template>
                    <template v-else>
                        <UTooltip text="Switch to English" :open-delay="300">
                            <img class="rounded-full sm:w-8 sm:h-8 h-8 w-8" src="/img/flag-en.png"
                                @click.stop="setLocale('en')" loading="lazy" />
                        </UTooltip>
                    </template>
                </button>
            </div>
            <!-- Left Section: Background Image -->
            <div class="hidden lg:block lg:col-span-6 h-screen relative">
                <img src="/img/logo-banner.png" class="absolute object-fill left-1/2 top-8 -translate-x-1/2 h-96" alt="logoBaner" />
                <img src="/img/banner.png" class=" absolute top-16 h-[61.111px] left-1/2 -translate-x-1/2" alt="baner" />
                <img src="/img/city.png" class="absolute bottom-20 left-0 w-full" alt="city" />
                <img src="/img/member.png" class="absolute object-fill bottom-8 left-1/2 -translate-x-1/2 h-[316.5px]" alt="member" />
                <img src="/img/bg.jpg" class="w-full h-full object-cover" alt="Background Image" />
            </div>
            <!-- Right Section: Slot Content -->
            <div class="col-span-10 lg:col-span-4 h-screen overflow-y-auto flex flex-col items-center justify-center px-4">
                <ErrorPage title="welcome"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
*, .font-base {
    font-family: "Noto Sans Thai", serif !important;
}
</style>

