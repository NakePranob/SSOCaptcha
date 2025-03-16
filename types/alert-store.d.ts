export { AlertType }

declare global {
    // Notification Type
    interface AlertType {
        state: string;
        url?: string;
        countdown?: number;
        title: string;
        description?: string;
    }
}