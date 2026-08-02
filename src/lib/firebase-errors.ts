const messages: Record<string, string> = {
  "auth/invalid-credential":
    "That email and password combination is not correct.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use":
    "An account already uses that email. Try logging in.",
  "auth/weak-password": "Use a stronger password with at least six characters.",
  "auth/user-disabled":
    "This sign-in has been disabled. Contact support if this is unexpected.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/network-request-failed":
    "The sign-in service could not be reached. Check your connection and try again.",
  "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
  "auth/popup-blocked":
    "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
  "auth/unauthorized-domain": "Sign-in is not enabled for this website domain.",
  "auth/operation-not-allowed": "This sign-in method has not been enabled yet.",
  "auth/captcha-check-failed":
    "The security check failed. Reload the page and try again.",
  "auth/requires-recent-login":
    "For security, sign out and back in before trying again.",
};

export function firebaseErrorMessage(
  error: unknown,
  fallback = "We couldn’t complete that request. Please try again.",
) {
  const code = (error as { code?: string }).code ?? "";
  return messages[code] || fallback;
}
