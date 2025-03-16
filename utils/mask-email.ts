export function maskEmail(email: string) {
    const [localPart, domain] = email.split("@");
    const maskedLocalPart = localPart[0] + "***";
    const domainParts = domain.split(".");
    const maskedDomain = domainParts[0][0] + "***.";
    return `${maskedLocalPart}@${maskedDomain}`;
}