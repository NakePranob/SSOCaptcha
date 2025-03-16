import { defineStore } from 'pinia';

export const usePageViewStore = defineStore('pageView', {
    state: (): {
        nextPage: string;
        nowPage: string;
    } => {
        return {
            nextPage: '',
            nowPage: '',
        };
    },
    actions: {
        setNextPage(view: string) {
            this.nextPage = view;
        },
        setNowPage(view: string) {
            this.nowPage = view;
        },
        setPage(view: string) {
            this.nextPage = view;
            this.nowPage = view;
        }
    }
});