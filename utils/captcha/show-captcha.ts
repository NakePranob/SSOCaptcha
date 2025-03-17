export function showCaptcha(
    captchaContainer: HTMLElement, 
    setIsCaptchaOpen: (value: boolean) => void,
    onSuccess?: (token: string) => void, 
    onError?: () => void
) {
    const AwsWafCaptcha = window.AwsWafCaptcha;

    setIsCaptchaOpen(true);
    if (captchaContainer) {
        AwsWafCaptcha.renderCaptcha(captchaContainer, {
            apiKey: "OKMMkkOV0+PhZPmNf966pumIptv9mQqTzRx9qMY28vOMnxXhIJz6Q5rWVAQ9kAOpe6kYXMFADsWPuKXe/JD6d8Q39DaEeHhlSVlHCi/X0R56/DsDrqCscuTXVn9alIpVJ4eiV9m0qhtJy/vmdx52hst91DsBOLZJTqmgRb9A5arFHF0gF7HpR92p1VS9bEuBcwGRcED9vVetPpnC2VmmnmA3ASUzOLhDp88IWPyRefYNIBjN6M6GUZORhp34znJO2CqmIvzCAHjmB8GoWxyVH//CaSn12155Y4ZADUQYC79uJfacH5FFBT72aOu7fq9HFlFhElQlKGdG5m0XMpHaxdx8JJvMFNEzfJUzH4Kep10TFWQOKgDkPR5MkGDQQ/0GW5Zr8DRhmhk7v+vlTmY2/FWjPG12g42EmvPb7ejfTUrFRxLNCM+cK8zwGOrkS9Fu1p9mqi4SKFS5mtliabP1vaHcvk25wbyRcGa9rAv4o60BBk9Y4vAUtLxsIMDd/VpdC2KN5KIfanAWry0H4ONiMLl58+9Ze9LgMJDVIcg/wcZWO/lVHLMPFBW8Piu73MRd0n5W0rptuUXAWqptLTF0t5uoNfFsRXZbg8QITOW2bV+1qEBFebe+NLTBUF0S9kTFDiagZJQMtDeH8LLtEAaB3+Ww0A3nuHCaLC6QBozBwuM=_1_1",
            onSuccess: (token:string) => {
                setIsCaptchaOpen(false);
                if (onSuccess) {
                    onSuccess(token);
                }
            },
            onError: () => {
                console.log('onError');
                if (onError) {
                    onError();
                }
            },
        });
    }
}