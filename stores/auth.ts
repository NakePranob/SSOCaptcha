import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        csrf: '',
        otp: {
            email: '',
            password: '',
            challengeName: '',
            reference: '',
            session: ''
        },
        codeVerification: {
            email: '',
            password: '',
            sessionId: '',
            reference: ''
        },
        forgotPassword: {
            email: '',
            sessionId: '',
            reference: ''
        },
        changPassword: {
            session: '',
            email: ''
        },
    }),
    getters: {
        getState: () => {
            return new URLSearchParams(window.location.search).get('state') || '';
        },
        getClientId: () => {
            return new URLSearchParams(window.location.search).get('client_id') || '';
        },
        getRedirectUri: () => {
            return new URLSearchParams(window.location.search).get('redirect_uri') || '';
        },
        getLogoutUri: () => {
            return new URLSearchParams(window.location.search).get('logout_uri') || '';
        },
        getResponseType: () => {
            return new URLSearchParams(window.location.search).get('response_type') || '';
        },
        getParams: () => {
            const route = useRoute();
            const count = Object.keys(route.query).length;
            if (count <= 0) return ''
            return `?${
                Object.entries(route.query)
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
                    .join('&')
            }`
        }
    },
    actions: {
        setCSRF(token: string) {
            this.csrf = token;
        },
        setOTP(obj: OTPType) {
            this.otp = obj;
        },
        setCodeVerification(obj: CodeVerificationType) {
            this.codeVerification = obj;
        },
        setForgotPassword(obj: ForgotPasswordType) {
            this.forgotPassword = obj;
        },
        setChangPassword(obj: ChangPasswordType) {
            this.changPassword = obj;
        },
    }
});
