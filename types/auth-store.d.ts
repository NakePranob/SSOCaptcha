export { OTPType, CodeVerificationType, ForgotPasswordType, ChangPasswordType, AuthState };

declare global {
  // OTP Type
  interface OTPType {
    email: string;
    password: string;
    challengeName: string;
    reference: string;
    session: string;
  }

  // Code Verification Type
  interface CodeVerificationType {
    email: string;
    password: string;
    sessionId: string;
    reference: string;
  }

  // Forgot Password Type
  interface ForgotPasswordType {
    email: string;
    sessionId: string;
    reference: string;
  }

  // Change Password Type
  interface ChangPasswordType {
    session: string;
    email: string;
  }

  // auth Stores State Type
  interface AuthState {
    csrf: string;
    captchaModalIsOpen: boolean;
    otp: OTPType;
    codeVerification: CodeVerificationType;
    forgotPassword: ForgotPasswordType;
    changPassword: ChangPasswordType;
  }
}