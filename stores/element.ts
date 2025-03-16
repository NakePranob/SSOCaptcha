import { defineStore } from 'pinia';

export interface ElementStoreType {
    formLoginHight: number;
    formRegisterHight: number;
    formForgotPasswordHight: number;
    formResetPasswordHight: number;
    formChangePasswordHight: number;
    formVerifyCodeEmailHight: number;
    formVerifyOTPHight: number;
    formAlertHight: number;
    passwordPolicyHeight: number;
}

export const useElementStore = defineStore('element', {
    state: (): ElementStoreType => {
        return {
            formLoginHight: 0,
            formRegisterHight: 0,
            formForgotPasswordHight: 0,
            formResetPasswordHight: 0,
            formChangePasswordHight: 0,
            formVerifyCodeEmailHight: 0,
            formVerifyOTPHight: 0,
            formAlertHight: 0,
            passwordPolicyHeight: 36
        };
    },
    actions: {
        setFormLoginHight(view: number) {
            this.formLoginHight = view;
        },
        setFormRegisterHight(view: number) {
            this.formRegisterHight = view;
        },
        setFormForgotPasswordHight(view: number) {
            this.formForgotPasswordHight = view;
        },
        setFormResetPasswordHight(view: number) {
            this.formResetPasswordHight = view;
        },
        setFormChangePasswordHight(view: number) {
            this.formChangePasswordHight = view;
        },
        setFormVerifyCodeEmailHight(view: number) {
            this.formVerifyCodeEmailHight = view;
        },
        setFormVerifyOTPHight(view: number) {
            this.formVerifyOTPHight = view;
        },
        setPasswordPolicyHeight(height: number) {
            this.passwordPolicyHeight = height;
        },
        setFormAlertHeight(height: number) {
            this.formAlertHight = height;
        },
    }
})