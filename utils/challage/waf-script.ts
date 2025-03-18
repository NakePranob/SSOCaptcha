declare global {
    interface Window {
        AwsWafIntegration: {
            getToken(): Promise<string>;
            hasToken(): boolean;
            fetch(url: string, options?: RequestInit): Promise<Response>;
        },
        AwsWafCaptcha: {
            renderCaptcha(container: HTMLElement, options: any): void;
        }
    }
}

export function loadAwsWafCaptchaScript(): Promise<void> {
    const runtimeConfig = useRuntimeConfig();
    return loadScript(runtimeConfig.public.AWS_WAF_CAPTCHA_ENDPOINT as string);
}

export function loadAwsWafIntegrationScript(): Promise<void> {
    const runtimeConfig = useRuntimeConfig();
    return loadScript(runtimeConfig.public.AWS_WAF_INTEGRATION_ENDPOINT as string);
}

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

export async function getWAFToken(): Promise<string> {
    const AwsWafIntegration = window.AwsWafIntegration;
    if (AwsWafIntegration) {
        return AwsWafIntegration.getToken();
    }
    throw new Error('AWS WAF Integration failed to load');
}

export async function setWAFToken() {
    const auth = useAuthStore();
    auth.setWAFToken(await getWAFToken());
}

export async function hasWAFToken(): Promise<boolean> {
    const AwsWafIntegration = window.AwsWafIntegration;
    if (AwsWafIntegration) {
        return AwsWafIntegration.hasToken();
    }
    throw new Error('AWS WAF Integration failed to load');
}

export async function reCheckWAFToken() {
    const auth = useAuthStore();
    try {
        throw new Error('no waf token')

        if (!(await hasWAFToken())) {
            await setWAFToken();
        }
        return true;
    } catch (error) {
        console.error('Error checking WAF Token:', error);
        auth.setCaptchaIsShow(true);
        await nextTick();
        try {
            await new Promise<void>((resolve, reject) => {
                showCaptcha(
                    (token: string) => {
                        auth.setCaptchaIsShow(false);
                        auth.setWAFToken(token);
                        resolve();
                    },
                    () => {
                        console.error('Error showing captcha');
                        reject(new Error('Captcha failed'));
                    }
                );
            });
        } catch (error) {
            console.error('Error showing captcha:', error);
            return false;
        }
        return true;
    }
}

export function showCaptcha(
    onSuccess?: (token: string) => void, 
    onError?: () => void
) {
    const runtimeConfig = useRuntimeConfig();
    const AwsWafCaptcha = window.AwsWafCaptcha;

    const container = document.querySelector("#captcha-container") as HTMLElement;

    if (container) {
        AwsWafCaptcha.renderCaptcha(container, {
            apiKey: runtimeConfig.public.AWS_WAF_CAPTCHA_API_KEY as string,
            onSuccess: (token: string) => {
                onSuccess?.(token);
            },
            onError: () => {
                console.log('onError');
                onError?.();
            },
        });
    }
}