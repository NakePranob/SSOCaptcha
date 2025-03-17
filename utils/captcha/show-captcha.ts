export function showCaptcha(
    captchaContainer: HTMLElement, 
    onSuccess?: (token: string) => void, 
    onError?: () => void
) {
    const auth = useAuthStore();
    const AwsWafCaptcha = window.AwsWafCaptcha;

    auth.setCaptchaModalIsOpen(true);
    
    if (captchaContainer) {
        AwsWafCaptcha.renderCaptcha(captchaContainer, {
            apiKey: "F4e3PjKdfPp4Vm8ss+FbP07Z2RRh8aZfAePhwk27th6+iImzGMo64PdLJTQxmgzoOTsanLmyFr/DgDOyDoPaNv7EpMe+EwLgfR/QUcT79JlHJzGnsFm3PRBAXqYsu6y9xROGDRqmexp+K4pJRXiNbn4GieaY9+4tOeSiXxJRuZkRJ/eZffQUypX1fef4ex6LocVkYJ1GiLBdT96ItJVYLXJfLtN8sb7hetQQEDRGkorbczhPlRilI4v6n8NcZlMdcxnbRxIeWDPbUbkypba4hWvXiYnIiKWzqnip4ONn3TKXGrro+kK22RTT3pYp3xaUQEMio6xEl64S5aAPjYwZMn7xGyxiyuTuZUAs2WJqwWgNlcPCGOo0QjE4WlnCkqWzUIdBfuekDlwdYbExTylF9dBLM7atf0Fx0AGB/U9gIBYAOlg7KcLj6BY2d+kebtXIGRYhSVZmHcPjdi5nEdnvykBsAje9jUdLcIbRHvERBtkytu2UVODCvc5EJ6VOQCMmnpe0oXq24DpnIvYCFrhCJ5cKrlNkiGui2K4Q3TW0s0KnHZHwNs5gjMdu6hb9de43FpKGPz7YYqlQeRIGWXHO6HyNMvhT9LJWTqfizRP4ZRH9rG1yq6I/4X6Vi8aaihJi34YBlEr7gvxyODfZ9jKNe5DVkqRFqB2yW0K+MbelstQ=_1_1",
            onSuccess: (token:string) => {
                auth.setCaptchaModalIsOpen(false);
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