/** Canonical password policy — keep in sync with feezo-backend/lib/password_policy.php */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export function passwordTooShortMessage(kind: "set" | "new" = "set"): string {
  if (kind === "new") {
    return `New password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
}

export function passwordHintLabel(): string {
  return `At least ${PASSWORD_MIN_LENGTH} characters`;
}

export function passwordUseMinMessage(): string {
  return `Use at least ${PASSWORD_MIN_LENGTH} characters`;
}
