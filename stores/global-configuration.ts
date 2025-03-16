import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
    state: (): {
        config: MAuthenConfiguration | null;
    } => {
        return {
            config: null,
        };
    },
    actions: {
        setConfig(obj: MAuthenConfiguration) {
            this.config = obj;
        },
    }
})