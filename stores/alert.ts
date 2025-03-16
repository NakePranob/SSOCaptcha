import { defineStore } from 'pinia';

export const useAlert = defineStore('alert', {
    state: (): {
        data: AlertType | null;
    } => {
        return {
            data: null
        };
    },
    actions: {
        setAlert(obj: AlertType) {
            this.data = obj;
        },
    }
})