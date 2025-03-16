// stores/countdown.ts
import { defineStore } from 'pinia'

interface CountdownState {
    timeLeft: number; // เวลาที่เหลือ (วินาที)
    interval: NodeJS.Timeout | null; // ตัวแปรสำหรับเก็บ setInterval
}

export const useCountdownStore = defineStore('countdown', {
    state: (): CountdownState => ({
        timeLeft: 0,  // เริ่มต้นที่ 10 นาที (600 วินาที)
        interval: null, // เก็บค่า interval สำหรับหยุดการนับถอยหลัง
    }),
    actions: {
        startCountdown() {
            const configTimeLeft = useGlobalStore().config?.OTP_EXPIRY_TIME ?? 600;

            if (this.interval) return;  // ถ้ามีการนับถอยหลังอยู่แล้วไม่ต้องเริ่มใหม่

            this.timeLeft = configTimeLeft

            this.interval = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    this.clearCountdown();  // หยุดเมื่อหมดเวลา
                }
            }, 1000);
        },
        clearCountdown() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;  // รีเซ็ตค่า interval
            }
        },
        resetCountdown() {
            const configTimeLeft = useGlobalStore().config?.OTP_EXPIRY_TIME ?? 300;

            this.clearCountdown();  // หยุดการนับถอยหลัง
            this.timeLeft = configTimeLeft;  // รีเซ็ตเวลาไปที่ 10 นาที
        },
        countDownNow() {
            this.resetCountdown();
            this.startCountdown();
        }
    }
})
