export { SystemConfiguration, MAuthenConfiguration };

declare global {
  interface SystemConfiguration {
    id: string;
    name: string;
    description: string;
    default_value: string;
    override_value: string;
    created_date: string;
    created_by: string;
    updated_date: string;
    updated_by: string;
  }

  interface MAuthenConfiguration {
    "2FA_ENABLED"?: "ON" | "OFF";
    INTERNAL_DOMAIN_LIST?: string[];
    LOGIN_ATTEMPT_LIMIT?: number;
    OTP_ATTEMPT_LIMIT?: number;
    OTP_CODE_LENGTH?: number;
    OTP_EXPIRY_TIME?: number;
  }
}
