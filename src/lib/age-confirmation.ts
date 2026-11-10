export const AGE_CONFIRMATION_STORAGE_KEY = "10trials-age";

export function ageConfirmationError(confirmed: boolean): string | null {
  return confirmed ? null : "You must confirm that you are 18 or older.";
}

export function readAgeConfirmation(
  saved: string | null,
  userId: string,
): boolean {
  if (!saved) return false;
  try {
    const value: unknown = JSON.parse(saved);
    if (
      typeof value !== "object" ||
      value === null ||
      !("userId" in value) ||
      value.userId !== userId ||
      !("confirmed" in value) ||
      value.confirmed !== true
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
