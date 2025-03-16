export { TypePassword, PasswordPolicyType }

declare global {
  type TypePassword = boolean;

  // Password Policy Type
  interface PasswordPolicyType {
    MinimumLength: number;
    RequireUppercase: boolean;
    RequireLowercase: boolean;
    RequireSymbols: boolean;
    RequireNumbers: boolean;
  }
}